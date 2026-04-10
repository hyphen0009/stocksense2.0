'use server';
/**
 * @fileOverview A Genkit flow for predicting product stockouts based on sales data.
 *
 * - predictiveStockAlerts - A function that initiates the stock prediction process.
 * - PredictiveStockAlertsInput - The input type for the predictiveStockAlerts function.
 * - PredictiveStockAlertsOutput - The return type for the predictiveStockAlerts function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
  prompt: `You are an expert inventory management assistant for a shopkeeper. Your task is to analyze product sales data and predict when products are likely to run out of stock. You need to provide clear, actionable predictions and reasoning.

Today's date is {{currentDate}}.

Here is the list of products with their current stock and historical sales data:
{{{JSON.stringify products}}}

Prediction Horizon: {{predictionHorizonDays}} days.

For each product in the 'products' array:
1.  **Calculate Average Daily Sales:** 
    *   Find the total 'quantitySold' from its 'salesHistory'.
    *   Find the date of the *earliest* sale in 'salesHistory'. If 'salesHistory' is empty, 'averageDailySales' is 0.
    *   Calculate 'TotalDaysSinceFirstSale' = ({{currentDate}} - earliest sale date) + 1.
    *   Set 'averageDailySales' = total quantity sold / 'TotalDaysSinceFirstSale'.
2.  **Determine Run-Out:**
    *   If 'currentStock' is 0, set 'predictedRunOutDate' to '{{currentDate}}', 'daysUntilRunOut' to 0.
    *   If 'averageDailySales' is 0, set 'predictedRunOutDate' and 'daysUntilRunOut' to null.
    *   Calculate 'daysUntilRunOut' = 'currentStock' / 'averageDailySales'.
    *   If 'daysUntilRunOut' <= 'predictionHorizonDays', 'predictedRunOutDate' = {{currentDate}} + 'daysUntilRunOut'. Otherwise null.
3.  **Provide Prediction Reasoning:** Explain specifically how 'averageDailySales' was calculated and the justification for the date.

Finally, compile a 'summary' that highlights products predicted to run out soon.

Ensure the entire output is a valid JSON object matching the PredictiveStockAlertsOutputSchema.
`,
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

    const { output } = await predictiveStockAlertsPrompt({
      ...input,
      currentDate,
      predictionHorizonDays: predictionHorizonDays,
    });
    return output!;
  }
);
