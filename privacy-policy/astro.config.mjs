// The CSS goes inside index.html and every other link is relative, so the
// built site works from any folder on the NAS, not only the domain root.
/** @type {import('astro').AstroUserConfig} */
export default {
  build: {
    inlineStylesheets: 'always',
  },
  devToolbar: {
    enabled: false,
  },
};
