import { defineConfig, fields } from '@linkbcms/core-tsdown';
import { CustomComponent } from '@/cms/custom-component';

export const cmsConfig = defineConfig({
  collections: {
    blogs: fields.collection({
      label: 'Blog Posts',
      fieldSlug: 'title',
      schema: {
        title: fields.text({ label: 'Title' }),
        content: fields.text({ label: 'Content' }),
      },
    }),
    settings: fields.singleton({
      label: 'Settings',
      schema: {
        title: fields.text({ label: 'Title' }),
      },
    }),
    custom: fields.customCollection({
      label: 'Custom',
      Component: CustomComponent,
    }),
    custom2: fields.customCollection({
      label: 'Custom 2',
      Component: () => <div className="bg-red-500 p-20">Custom 2</div>,
    }),
  },
});
