using Aps.Simple.Viewer.Application.Models;
using Microsoft.AspNetCore.Mvc;

namespace Aps.Simple.Viewer.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly APS _aps;

        public AuthController(APS aps)
        {
            _aps = aps;
        }

        [HttpGet("token")]
        public async Task<IActionResult> GetAccessToken()
        {
            var token = await _aps.GetPublicToken();
            return Ok(new
            {
                access_token = token.AccessToken,
                expires_in = (long)Math.Round((token.ExpiresAt - DateTime.UtcNow).TotalSeconds)
            });
        }
    }
}
