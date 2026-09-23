using CitizenFlowApi.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ── Database ─────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(
        builder.Configuration.GetConnectionString("DefaultConnection")
        ?? "Data Source=citizenflow.db"));

// ── CORS ──────────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        var origins = builder.Configuration
            .GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? ["http://localhost:4200"];

        policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod();
    });
});

// ── MVC + Swagger ─────────────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "CitizenFlow API", Version = "v1",
        Description = "US Citizenship Test Prep API — questions, officials, fluency" });

    c.AddSecurityDefinition("ApiKey", new()
    {
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        In   = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Name = "X-Admin-Key",
        Description = "Admin API key for protected /api/admin/* endpoints",
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new() { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "ApiKey" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ── Migrate & Seed ────────────────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await DbSeeder.SeedAsync(db);
}

// ── Middleware ────────────────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    // Root ("/") has no page; send it to the API docs in development.
    app.MapGet("/", () => Results.Redirect("/swagger"));
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthorization();
app.MapControllers();

app.Run();

// Exposed so the integration test project can bootstrap the app via
// WebApplicationFactory<Program>.
public partial class Program { }
