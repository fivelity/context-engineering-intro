
import root from '../root.js';
import { set_building, set_prerendering } from '__sveltekit/environment';
import { set_assets } from '__sveltekit/paths';
import { set_manifest, set_read_implementation } from '__sveltekit/server';
import { set_private_env, set_public_env, set_safe_public_env } from '../../../node_modules/@sveltejs/kit/src/runtime/shared-server.js';

export const options = {
	app_template_contains_nonce: false,
	csp: {"mode":"auto","directives":{"upgrade-insecure-requests":false,"block-all-mixed-content":false},"reportOnly":{"upgrade-insecure-requests":false,"block-all-mixed-content":false}},
	csrf_check_origin: true,
	embedded: false,
	env_public_prefix: 'PUBLIC_',
	env_private_prefix: '',
	hash_routing: false,
	hooks: null, // added lazily, via `get_hooks`
	preload_strategy: "modulepreload",
	root,
	service_worker: false,
	templates: {
		app: ({ head, body, assets, nonce, env }) => "<!doctype html>\n<html lang=\"en\" data-theme=\"dark\">\n  <head>\n    <meta charset=\"utf-8\" />\n    <link rel=\"icon\" href=\"" + assets + "/favicon.png\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n    <meta name=\"description\" content=\"SenseCanvas - Futuristic PC Hardware Monitoring Dashboard\" />\n    <meta name=\"keywords\" content=\"hardware monitoring, PC dashboard, real-time metrics, cyberpunk UI, gaming dashboard\" />\n    <meta name=\"author\" content=\"SenseCanvas Team\" />\n    \n    <!-- Theme color for mobile browsers -->\n    <meta name=\"theme-color\" content=\"#00ffff\" />\n    \n    <!-- Open Graph meta tags -->\n    <meta property=\"og:title\" content=\"SenseCanvas - PC Hardware Monitoring Dashboard\" />\n    <meta property=\"og:description\" content=\"Real-time hardware monitoring with futuristic sci-fi aesthetics\" />\n    <meta property=\"og:type\" content=\"website\" />\n    <meta property=\"og:image\" content=\"" + assets + "/og-image.png\" />\n    \n    <!-- Preconnect to external domains for performance -->\n    <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\" />\n    <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin />\n    \n    <!-- Prevent FOUC (Flash of Unstyled Content) -->\n    <style>\n      /* Critical CSS for initial page load */\n      body {\n        margin: 0;\n        padding: 0;\n        background: #0a0a0a;\n        color: white;\n        font-family: 'JetBrains Mono', monospace;\n        overflow-x: hidden;\n      }\n      \n      /* Loading screen */\n      .initial-loader {\n        position: fixed;\n        top: 0;\n        left: 0;\n        width: 100%;\n        height: 100%;\n        background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        z-index: 9999;\n        transition: opacity 0.5s ease-out;\n      }\n      \n      .loader-content {\n        text-align: center;\n        color: #00ffff;\n      }\n      \n      .loader-spinner {\n        width: 40px;\n        height: 40px;\n        border: 3px solid rgba(0, 255, 255, 0.3);\n        border-top: 3px solid #00ffff;\n        border-radius: 50%;\n        animation: spin 1s linear infinite;\n        margin: 0 auto 20px;\n      }\n      \n      .loader-text {\n        font-size: 18px;\n        font-weight: 500;\n        letter-spacing: 2px;\n        animation: pulse 2s ease-in-out infinite;\n      }\n      \n      @keyframes spin {\n        0% { transform: rotate(0deg); }\n        100% { transform: rotate(360deg); }\n      }\n      \n      @keyframes pulse {\n        0%, 100% { opacity: 1; }\n        50% { opacity: 0.5; }\n      }\n      \n      /* Hide loader when app is ready */\n      .app-ready .initial-loader {\n        opacity: 0;\n        pointer-events: none;\n      }\n    </style>\n    \n    " + head + "\n  </head>\n  <body data-sveltekit-preload-data=\"hover\" class=\"antialiased\">\n    <!-- Initial loading screen -->\n    <div class=\"initial-loader\" id=\"initial-loader\">\n      <div class=\"loader-content\">\n        <div class=\"loader-spinner\"></div>\n        <div class=\"loader-text\">INITIALIZING SENSECANVAS</div>\n      </div>\n    </div>\n    \n    <!-- Main application container -->\n    <div style=\"display: contents\" id=\"svelte-app\">" + body + "</div>\n    \n    <!-- Remove loader when app is ready -->\n    <script>\n      // Remove initial loader when DOM is loaded\n      document.addEventListener('DOMContentLoaded', function() {\n        setTimeout(() => {\n          document.body.classList.add('app-ready');\n          setTimeout(() => {\n            const loader = document.getElementById('initial-loader');\n            if (loader) {\n              loader.remove();\n            }\n          }, 500);\n        }, 1000);\n      });\n      \n      // Console welcome message\n      console.log(`\n        ███████╗███████╗███╗   ███╗███████╗███████╗ ██████╗ █████╗ ███╗   ██╗██╗   ██╗ █████╗ ███████╗\n        ██╔════╝██╔════╝████╗ ████║██╔════╝██╔════╝██╔════╝██╔══██╗████╗  ██║██║   ██║██╔══██╗██╔════╝\n        ███████╗█████╗  ██╔████╔██║███████╗█████╗  ██║     ███████║██╔██╗ ██║██║   ██║███████║███████╗\n        ╚════██║██╔══╝  ██║╚██╔╝██║╚════██║██╔══╝  ██║     ██╔══██║██║╚██╗██║╚██╗ ██╔╝██╔══██║╚════██║\n        ███████║███████╗██║ ╚═╝ ██║███████║███████╗╚██████╗██║  ██║██║ ╚████║ ╚████╔╝ ██║  ██║███████║\n        ╚══════╝╚══════╝╚═╝     ╚═╝╚══════╝╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═══╝  ╚═╝  ╚═╝╚══════╝\n        \n        🔮 Futuristic PC Hardware Monitoring Dashboard\n        🚀 Real-time metrics • AI-powered customization • Sci-fi aesthetics\n        \n        Built with ❤️ using Svelte 5, FastAPI, and cutting-edge technologies.\n      `);\n    </script>\n  </body>\n</html>",
		error: ({ status, message }) => "<!doctype html>\n<html lang=\"en\">\n\t<head>\n\t\t<meta charset=\"utf-8\" />\n\t\t<title>" + message + "</title>\n\n\t\t<style>\n\t\t\tbody {\n\t\t\t\t--bg: white;\n\t\t\t\t--fg: #222;\n\t\t\t\t--divider: #ccc;\n\t\t\t\tbackground: var(--bg);\n\t\t\t\tcolor: var(--fg);\n\t\t\t\tfont-family:\n\t\t\t\t\tsystem-ui,\n\t\t\t\t\t-apple-system,\n\t\t\t\t\tBlinkMacSystemFont,\n\t\t\t\t\t'Segoe UI',\n\t\t\t\t\tRoboto,\n\t\t\t\t\tOxygen,\n\t\t\t\t\tUbuntu,\n\t\t\t\t\tCantarell,\n\t\t\t\t\t'Open Sans',\n\t\t\t\t\t'Helvetica Neue',\n\t\t\t\t\tsans-serif;\n\t\t\t\tdisplay: flex;\n\t\t\t\talign-items: center;\n\t\t\t\tjustify-content: center;\n\t\t\t\theight: 100vh;\n\t\t\t\tmargin: 0;\n\t\t\t}\n\n\t\t\t.error {\n\t\t\t\tdisplay: flex;\n\t\t\t\talign-items: center;\n\t\t\t\tmax-width: 32rem;\n\t\t\t\tmargin: 0 1rem;\n\t\t\t}\n\n\t\t\t.status {\n\t\t\t\tfont-weight: 200;\n\t\t\t\tfont-size: 3rem;\n\t\t\t\tline-height: 1;\n\t\t\t\tposition: relative;\n\t\t\t\ttop: -0.05rem;\n\t\t\t}\n\n\t\t\t.message {\n\t\t\t\tborder-left: 1px solid var(--divider);\n\t\t\t\tpadding: 0 0 0 1rem;\n\t\t\t\tmargin: 0 0 0 1rem;\n\t\t\t\tmin-height: 2.5rem;\n\t\t\t\tdisplay: flex;\n\t\t\t\talign-items: center;\n\t\t\t}\n\n\t\t\t.message h1 {\n\t\t\t\tfont-weight: 400;\n\t\t\t\tfont-size: 1em;\n\t\t\t\tmargin: 0;\n\t\t\t}\n\n\t\t\t@media (prefers-color-scheme: dark) {\n\t\t\t\tbody {\n\t\t\t\t\t--bg: #222;\n\t\t\t\t\t--fg: #ddd;\n\t\t\t\t\t--divider: #666;\n\t\t\t\t}\n\t\t\t}\n\t\t</style>\n\t</head>\n\t<body>\n\t\t<div class=\"error\">\n\t\t\t<span class=\"status\">" + status + "</span>\n\t\t\t<div class=\"message\">\n\t\t\t\t<h1>" + message + "</h1>\n\t\t\t</div>\n\t\t</div>\n\t</body>\n</html>\n"
	},
	version_hash: "1v66l4"
};

export async function get_hooks() {
	let handle;
	let handleFetch;
	let handleError;
	let init;
	

	let reroute;
	let transport;
	

	return {
		handle,
		handleFetch,
		handleError,
		init,
		reroute,
		transport
	};
}

export { set_assets, set_building, set_manifest, set_prerendering, set_private_env, set_public_env, set_read_implementation, set_safe_public_env };
