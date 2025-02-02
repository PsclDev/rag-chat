// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2024-11-01",
	devtools: { enabled: true },
	ssr: false,
	modules: ["@nuxt/ui", "@pinia/nuxt"],
	runtimeConfig: {
		public: {
			apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL
		}
	}
});
