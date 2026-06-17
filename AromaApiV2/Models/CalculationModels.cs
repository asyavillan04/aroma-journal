namespace AromaApi.Models;

public class VariantCalculationRequest
{
    public string Measure { get; set; } = "percent";  // percent, drops, ml, mg
    public decimal? TotalAmount { get; set; }         // имеет смысл только если Measure != percent
    public List<IngredientAmount> Ingredients { get; set; } = new();
}

public class IngredientAmount
{
    public string IngredientId { get; set; } = "";
    public decimal Amount { get; set; }
}

public class VariantCalculationResponse
{
    public string Measure { get; set; } = "";
    public decimal? TotalAmount { get; set; }
    public List<IngredientWithPercent> Ingredients { get; set; } = new();
    public decimal CurrentSum { get; set; }
    public bool IsPercentTotalOk { get; set; }
    public List<IngredientAmount>? ScaledTo100 { get; set; } // null, если не требуется
}

public class IngredientWithPercent
{
    public string IngredientId { get; set; } = "";
    public decimal Amount { get; set; }
    public decimal Percent { get; set; }
}