using AromaApi.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://127.0.0.1:5500", "http://localhost:5500",
                           "http://127.0.0.1:5501", "http://localhost:5501")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddSingleton<CalculationService>();

var app = builder.Build();

app.UseCors();

app.MapGet("/", () => "Aroma Journal API is running!");

app.MapGet("/api/calculate", () => Results.Ok(new { result = 42, message = "Hello from C#!" }));

app.MapPost("/api/calculate", (CalculationService service, AromaApi.Models.VariantCalculationRequest request) =>
{
    var response = service.Calculate(request);
    return Results.Ok(response);
});

app.Urls.Add("http://localhost:5000");

app.Run();