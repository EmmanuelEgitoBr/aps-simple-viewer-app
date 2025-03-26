using Aps.Simple.Viewer.Application.Models;

namespace Aps.Simple.Viewer.Api.Extensions;

public static class BuilderExtensions
{
    public static void AddApsConfiguration(this WebApplicationBuilder builder, IConfiguration configuration)
    {
        var clientID = configuration["APS:APS_CLIENT_ID"];
        var clientSecret = configuration["APS:APS_CLIENT_SECRET"];
        var bucket = configuration["APS:APS_BUCKET"]; // Optional
        if (string.IsNullOrEmpty(clientID) || string.IsNullOrEmpty(clientSecret))
        {
            throw new ApplicationException("Missing required environment variables APS_CLIENT_ID or APS_CLIENT_SECRET.");
        }
        builder.Services.AddSingleton(new APS(clientID, clientSecret, bucket!));
    }
}
