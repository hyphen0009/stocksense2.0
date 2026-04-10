'use server';
/**
 * @fileOverview A Genkit flow for predicting product stockouts based on sales data.
 *
 * - predictiveStockAlerts - A function that initiates the stock prediction process.
 * - PredictiveStockAlertsInput - The input type for the predictiveStockAlerts function.
 * - PredictiveStockAlertsOutput - The return type for the predictiveStockAlerts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductSalesDataSchema = z.object({
  productId: z.string().describe('Unique identifier for the product.'),
  productName: z.string().describe('Name of the product.'),
  currentStock: z.number().int().min(0).describe('Current quantity of the product in stock.'),
  salesHistory: z.array(
    z.object({
      date: z.string().describe('Date of the sales record (YYYY-MM-DD).'),
      quantitySold: z.number().int().min(0).describe('Quantity of this product sold on this date.'),
    })
  ).describe('Historical daily sales data for the product, sorted by date in ascending order. Should include at least 7 days of sales for meaningful analysis.'),
});

const PredictiveStockAlertsInputSchema = z.object({
  products: z.array(ProductSalesDataSchema).describe('List of products with their current stock and historical sales data.'),
  predictionHorizonDays: z.number().int().min(1).default(60).describe('The number of days into the future to predict stockouts. Products predicted to run out beyond this horizon will have null for run-out date/days.'),
});
export type PredictiveStockAlertsInput = z.infer<typeof PredictiveStockAlertsInputSchema>;

const ProductRunOutPredictionSchema = z.object({
  productId: z.string().describe('Unique identifier for the product.'),
  productName: z.string().describe('Name of the product.'),
  currentStock: z.number().int().min(0).describe('Current quantity of the product in stock.'),
  averageDailySales: z.number().nullable().describe('Calculated average daily sales based on available sales history. Null if no sales data or current stock is zero. Represents the mean quantity sold per distinct day of sales activity.'),
  predictedRunOutDate: z.string().nullable().describe('Estimated date (YYYY-MM-DD) when the product will run out. Null if not predicted to run out within the prediction horizon, if average daily sales is zero/null, or if current stock is already zero and average daily sales was also zero.'),
  daysUntilRunOut: z.number().int().nullable().describe('Number of days until the product is predicted to run out. Null if not predicted to run out within the prediction horizon, if average daily sales is zero/null, or if current stock is already zero and average daily sales was also zero.'),
  predictionReasoning: z.string().describe('Explanation for the prediction, including how average daily sales was calculated, any assumptions made (e.g., if no sales data, assume no sales), and why a run-out date is or is not provided.'),
});

const PredictiveStockAlertsOutputSchema = z.object({
  predictions: z.array(ProductRunOutPredictionSchema).describe('List of stockout predictions for each product.'),
  summary: z.string().describe('A summary of all predictions, highlighting critical low stock items and providing actionable insights for reordering.'),
});
export type PredictiveStockAlertsOutput = z.infer<typeof PredictiveStockAlertsOutputSchema>;

export async function predictiveStockAlerts(input: PredictiveStockAlertsInput): Promise<PredictiveStockAlertsOutput> {
  return predictiveStockAlertsFlow(input);
}

const predictiveStockAlertsPrompt = ai.definePrompt({
  name: 'predictiveStockAlertsPrompt',
  input: { schema: PredictiveStockAlertsInputSchema },
  output: { schema: PredictiveStockAlertsOutputSchema },
  prompt: `You are an expert inventory management assistant for a shopkeeper. Your task is to analyze product sales data and predict when products are likely to run out of stock. You need to provide clear, actionable predictions and reasoning.\n\nToday's date is {{currentDate}}.\n\nHere is the list of products with their current stock and historical sales data:\n{{{JSON.stringify products}}}\n\nPrediction Horizon: {{predictionHorizonDays}} days. Only predict run-out dates for products expected to deplete within this timeframe. If a product will last longer, its predictedRunOutDate and daysUntilRunOut should be null.\n\nFor each product in the 'products' array:\n1.  **Calculate Average Daily Sales:** Sum all 'quantitySold' from its 'salesHistory'. Then, count the number of *distinct dates* present in the 'salesHistory'. Divide the total quantity sold by the number of distinct sales days to get the 'averageDailySales'. If 'salesHistory' is empty, or if all 'quantitySold' values are 0, set 'averageDailySales' to 0.\n2.  **Determine Run-Out:**\n    *   If 'currentStock' is 0, the product has already run out. Set 'predictedRunOutDate' to '{{currentDate}}', 'daysUntilRunOut' to 0.\n    *   If 'averageDailySales' is 0 (and current stock is not 0), the product is not selling. Set 'predictedRunOutDate' and 'daysUntilRunOut' to null, as it's not predicted to run out due to sales.\n    *   If 'averageDailySales' is greater than 0:\n        *   Calculate 'daysUntilRunOut' by dividing 'currentStock' by 'averageDailySales' (round down to the nearest whole number of days).\n        *   If 'daysUntilRunOut' is within the 'predictionHorizonDays' (i.e., less than or equal to 'predictionHorizonDays'), calculate 'predictedRunOutDate'. Add 'daysUntilRunOut' to '{{currentDate}}' to get the future date in 'YYYY-MM-DD' format.\n        *   Otherwise (if 'daysUntilRunOut' is greater than 'predictionHorizonDays'), set 'predictedRunOutDate' and 'daysUntilRunOut' to null.\n3.  **Provide Prediction Reasoning:** Explain your calculations for 'averageDailySales', how 'daysUntilRunOut' was derived, and the justification for the 'predictedRunOutDate' (or why it's null).\n    For example, if average daily sales is 0 and current stock is not 0, explain that the product is not selling and thus not predicted to run out.\n\nFinally, compile a 'summary' that highlights products predicted to run out soon (e.g., within the next 7 to 14 days, specifically mention products with \`daysUntilRunOut\` values <= 14), suggests reordering actions for critical items, and provides an overall assessment of the inventory health based on the predictions.\n\nEnsure the entire output is a valid JSON object matching the PredictiveStockAlertsOutputSchema, with all fields correctly populated.\n`,
});

const predictiveStockAlertsFlow = ai.defineFlow(
  {
    name: 'predictiveStockAlertsFlow',
    inputSchema: PredictiveStockAlertsInputSchema,
    outputSchema: PredictiveStockAlertsOutputSchema,
  },
  async (input) => {
    const today = new Date();
    // Format today's date as YYYY-MM-DD
    const currentDate = today.getFullYear() + '-' +
                        String(today.getMonth() + 1).padStart(2, '0') + '-' +
                        String(today.getDate()).padStart(2, '0');

    // Ensure predictionHorizonDays has a default if not provided
    const predictionHorizonDays = input.predictionHorizonDays !== undefined ? input.predictionHorizonDays : 60;

    const {output} = await predictiveStockAlertsPrompt({
      ...input,
      currentDate,
      predictionHorizonDays: predictionHorizonDays,
    });
    return output!;
  }
);
