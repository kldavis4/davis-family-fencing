import {defineSchema, TinaTemplate} from "tinacms";

const videoTemplate: TinaTemplate = {
  name: "video",
  label: "Video",
  fields: [
    {
      type: "string",
      name: "title",
      label: "Title",
    },
    {
      type: "datetime",
      name: "publishedAt",
      label: "Published At",
    },
    {
      type: "string",
      name: "videoId",
      label: "Video ID",
    },
    {
      type: "string",
      ui: {
        component: "markdown",
      },
      label: "Description",
      name: "description",
    },
    {
      type: "number",
      name: "position",
      label: "Position"
    },
    {
      type: "object",
      name: "thumbnail_default",
      label: "Default Thumbnail",
      fields: [
        {
          type: "string",
          name: "url",
          label: "URL"
        },
        {
          type: "number",
          name: "width",
          label: "Width"
        },
        {
          type: "number",
          name: "height",
          label: "Height"
        }
      ]
    },
    {
      type: "object",
      name: "thumbnail_medium",
      label: "Medium Thumbnail",
      fields: [
        {
          type: "string",
          name: "url",
          label: "URL"
        },
        {
          type: "number",
          name: "width",
          label: "Width"
        },
        {
          type: "number",
          name: "height",
          label: "Height"
        }
      ]
    },
    {
      type: "object",
      name: "thumbnail_high",
      label: "High Thumbnail",
      fields: [
        {
          type: "string",
          name: "url",
          label: "URL"
        },
        {
          type: "number",
          name: "width",
          label: "Width"
        },
        {
          type: "number",
          name: "height",
          label: "Height"
        }
      ]
    },
    {
      type: "object",
      name: "thumbnail_standard",
      label: "Standard Thumbnail",
      fields: [
        {
          type: "string",
          name: "url",
          label: "URL"
        },
        {
          type: "number",
          name: "width",
          label: "Width"
        },
        {
          type: "number",
          name: "height",
          label: "Height"
        }
      ]
    },
    {
      type: "object",
      name: "thumbnail_maxres",
      label: "Maxres Thumbnail",
      fields: [
        {
          type: "string",
          name: "url",
          label: "URL"
        },
        {
          type: "number",
          name: "width",
          label: "Width"
        },
        {
          type: "number",
          name: "height",
          label: "Height"
        }
      ]
    }
  ],
}

const schema = defineSchema({
  collections: [
    {
      label: "Playlists",
      name: "playlist",
      path: "content/playlists",
      fields: [
        {
          type: "string",
          name: "title",
          label: "Title",
        },
        {
          type: "datetime",
          name: "publishedAt",
          label: "Published At",
        },
        {
          type: "string",
          ui: {
            component: "markdown",
          },
          label: "Description",
          name: "description",
        },
        {
          type: "object",
          name: "thumbnail_default",
          label: "Default Thumbnail",
          fields: [
            {
              type: "string",
              name: "url",
              label: "URL"
            },
            {
              type: "number",
              name: "width",
              label: "Width"
            },
            {
              type: "number",
              name: "height",
              label: "Height"
            }
          ]
        },
        {
          type: "object",
          name: "thumbnail_medium",
          label: "Medium Thumbnail",
          fields: [
            {
              type: "string",
              name: "url",
              label: "URL"
            },
            {
              type: "number",
              name: "width",
              label: "Width"
            },
            {
              type: "number",
              name: "height",
              label: "Height"
            }
          ]
        },
        {
          type: "object",
          name: "thumbnail_high",
          label: "High Thumbnail",
          fields: [
            {
              type: "string",
              name: "url",
              label: "URL"
            },
            {
              type: "number",
              name: "width",
              label: "Width"
            },
            {
              type: "number",
              name: "height",
              label: "Height"
            }
          ]
        },
        {
          type: "object",
          name: "thumbnail_standard",
          label: "Standard Thumbnail",
          fields: [
            {
              type: "string",
              name: "url",
              label: "URL"
            },
            {
              type: "number",
              name: "width",
              label: "Width"
            },
            {
              type: "number",
              name: "height",
              label: "Height"
            }
          ]
        },
        {
          type: "object",
          name: "thumbnail_maxres",
          label: "Maxres Thumbnail",
          fields: [
            {
              type: "string",
              name: "url",
              label: "URL"
            },
            {
              type: "number",
              name: "width",
              label: "Width"
            },
            {
              type: "number",
              name: "height",
              label: "Height"
            }
          ]
        },
        {
          type: "object",
          list: true,
          name: "videos",
          label: "Videos",
          templates: [
            videoTemplate
          ]
        },
      ],
    },
  ],
});

export default schema
