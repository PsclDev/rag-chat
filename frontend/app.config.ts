export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',
      neutral: 'gray',
      success: 'emerald',
    },
    card: {
      variants: {
        variant: {
          outline: {
            root: 'bg-gray-900 border border-gray-900 ring-gray-800'
          }
        }
      }
    },
    modal: {
      variants: {
        fullscreen: {
          false: {
            content: 'sm:max-w-2xl'
          }
        }
      }
    }
  }
})