using Microsoft.EntityFrameworkCore;
using CitizenshipBackend.Data;
using CitizenshipBackend.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "US Citizenship Test API", Version = "v1", Description = "Backend API for the US Citizenship Test mobile app." });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("CitizenshipDb"));

builder.Services.AddHttpClient();
builder.Services.AddScoped<WikiScraperService>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "US Citizenship Test API v1"));

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await DbSeeder.SeedAsync(context);
}

app.Run();