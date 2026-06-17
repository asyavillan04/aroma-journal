namespace AromaApi.Services;

using AromaApi.Models;

public class CalculationService
{
    public VariantCalculationResponse Calculate(VariantCalculationRequest request)
    {
        var response = new VariantCalculationResponse
        {
            Measure = request.Measure,
            Ingredients = new List<IngredientWithPercent>()
        };

        decimal total = request.Ingredients.Sum(i => i.Amount);

        // Вычисляем проценты
        if (request.Measure == "percent")
        {
            response.TotalAmount = 100; // всегда 100 для процентов
            response.CurrentSum = total;
            response.IsPercentTotalOk = Math.Abs(total - 100) < 0.001m;

            foreach (var ing in request.Ingredients)
            {
                response.Ingredients.Add(new IngredientWithPercent
                {
                    IngredientId = ing.IngredientId,
                    Amount = ing.Amount,
                    Percent = ing.Amount // уже проценты
                });
            }

            // Пересчёт до 100% (пропорционально)
            if (!response.IsPercentTotalOk && total > 0)
            {
                response.ScaledTo100 = request.Ingredients.Select(ing => new IngredientAmount
                {
                    IngredientId = ing.IngredientId,
                    Amount = Math.Round(ing.Amount / total * 100, 2)
                }).ToList();
            }
        }
        else // drops, ml, mg
        {
            response.TotalAmount = request.TotalAmount ?? total;
            response.CurrentSum = total;
            response.IsPercentTotalOk = true; // для не-процентов всегда ок
            foreach (var ing in request.Ingredients)
            {
                decimal percent = total > 0 ? Math.Round(ing.Amount / total * 100, 2) : 0;
                response.Ingredients.Add(new IngredientWithPercent
                {
                    IngredientId = ing.IngredientId,
                    Amount = ing.Amount,
                    Percent = percent
                });
            }
            // scaledTo100 для не-процентов не вычисляем
        }

        return response;
    }
}