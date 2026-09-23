using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace CitizenshipBackend.Tests;

public class AdminControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    private static readonly JsonSerializerOptions JsonOpts =
        new() { PropertyNameCaseInsensitive = true };

    public AdminControllerTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private sealed record FederalOfficialDto(int Id, string Title, string Name, string Party);

    private HttpClient AuthedClient()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Admin-Key", CustomWebApplicationFactory.AdminKey);
        return client;
    }

    [Fact]
    public async Task GetFederalOfficials_WithoutKey_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/admin/officials/federal");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetFederalOfficials_WithKey_ReturnsSeededOfficials()
    {
        var client = AuthedClient();
        var officials = await client.GetFromJsonAsync<List<FederalOfficialDto>>(
            "/api/admin/officials/federal", JsonOpts);

        Assert.NotNull(officials);
        Assert.Contains(officials!, o => o.Title == "President");
    }

    [Fact]
    public async Task UpdateFederalOfficial_PersistsNewNameAndParty()
    {
        var client = AuthedClient();

        var officials = await client.GetFromJsonAsync<List<FederalOfficialDto>>(
            "/api/admin/officials/federal", JsonOpts);
        var president = officials!.Single(o => o.Title == "President");

        var updated = new FederalOfficialDto(president.Id, "President", "Jane Q. Public", "Independent");
        var putResponse = await client.PutAsJsonAsync(
            $"/api/admin/officials/federal/{president.Id}", updated);
        putResponse.EnsureSuccessStatusCode();

        // Read back via a fresh request to confirm the change was saved.
        var after = await client.GetFromJsonAsync<List<FederalOfficialDto>>(
            "/api/admin/officials/federal", JsonOpts);
        var reloaded = after!.Single(o => o.Id == president.Id);

        Assert.Equal("Jane Q. Public", reloaded.Name);
        Assert.Equal("Independent", reloaded.Party);
    }

    [Fact]
    public async Task UpdateFederalOfficialByTitle_PersistsNewName()
    {
        var client = AuthedClient();

        var updated = new FederalOfficialDto(0, "President", "Jane Q. Public", "");
        var putResponse = await client.PutAsJsonAsync(
            "/api/admin/officials/federal/title/President", updated);
        putResponse.EnsureSuccessStatusCode();

        var after = await client.GetFromJsonAsync<List<FederalOfficialDto>>(
            "/api/admin/officials/federal", JsonOpts);
        var president = after!.Single(o => o.Title == "President");

        Assert.Equal("Jane Q. Public", president.Name);
        // Party left blank in the request must be preserved, not wiped.
        Assert.False(string.IsNullOrEmpty(president.Party));
    }

    [Fact]
    public async Task UpdateFederalOfficialByTitle_UnknownTitle_ReturnsNotFound()
    {
        var client = AuthedClient();
        var body = new FederalOfficialDto(0, "Emperor", "Nobody", "None");
        var response = await client.PutAsJsonAsync("/api/admin/officials/federal/title/Emperor", body);
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdateFederalOfficial_UnknownId_ReturnsNotFound()
    {
        var client = AuthedClient();
        var body = new FederalOfficialDto(999999, "President", "Nobody", "None");
        var response = await client.PutAsJsonAsync("/api/admin/officials/federal/999999", body);
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdateStateOfficial_PersistsGovernorChange()
    {
        var client = AuthedClient();

        var body = new
        {
            StateCode = "WI",
            StateName = "Wisconsin",
            Capital = "Madison",
            Governor = "New Governor Name",
            Senators = new[] { "Senator A", "Senator B" },
        };

        var putResponse = await client.PutAsJsonAsync("/api/admin/officials/state/WI", body);
        putResponse.EnsureSuccessStatusCode();

        var getResponse = await client.GetAsync("/api/admin/officials/state/WI");
        getResponse.EnsureSuccessStatusCode();
        var raw = await getResponse.Content.ReadAsStringAsync();

        Assert.Contains("New Governor Name", raw);
        Assert.Contains("Senator A", raw);
    }
}
