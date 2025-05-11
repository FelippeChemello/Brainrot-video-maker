Your task is to create a script for a video about "HOW DOES YOUTUBE HANDLE STREAMING OF BILLIONS OF VIDEOS DAILY?" 

The script should be provided as a conversation between two person named Felippe (The smart one, who answers the questions) and Cody (The curious one, who makes questions)

The output must be a JSON array with the following structure
```typescript
type Script = Array<{
    speaker: 'Felippe' | 'Cody'; 
    text: string; // Use <bold> tag to make some words highlighted, the text should be in Portuguese language
    image_description?: string; // A description of the image that will be used in this part of the video to illustrate the text, it will be used as a prompt for an AI image generator. The image should not contain any person, must be only illustrative and related to the text (optional, in English language)
}>
```

In the script, Felippe should provide detailed and technical explanations, while Cody should ask questions that are more general and easy to understand. The script should be engaging and informative, with a friendly tone.

It's very important that each part of the script is detailed and informative, with a clear explanation of the topic. The script should also be engaging and easy to understand. Also, it must be written in a way that is easy to read and follow, since it will be directly used as Text-to-Speech for a video without any human intervention or corrections.

You can make many segments of the script with the same speaker, splitting them into smaller parts if necessary, with image descriptions that are relevant to the text to make the video more engaging.

Also, certify that the text has highlighted words using the <bold> tag, since it catches the attention of the audience and makes it easier to read.

Here is an example of how the script should look like:
```json
[
    {
        "speaker": "stewie",
        "text": "Peter, how does <bold>TikTok</bold> store billions of videos and load them so fast?",
        "image_description": "Tiktok logo"
    },
    {
        "speaker": "peter",
        "text": "They store <bold>videos</bold> in object storage like S3 or GCS.",
        "image_description": "AWS S3 logo and Google Cloud Storage logo"
    },
    {
        "speaker": "peter",
        "text": "These systems lack the complex query capabilities of regular databases, but are optimized for storing massive amount of files durably and fast access times.",
        "image_description": "A data center with many servers"
    },
    {
        "speaker": "stewie",
        "text": "Okay, that explains the <bold>storage</bold>, but how do they load so <bold>fast?</bold>",
        "image_description": "A person using a smartphone with TikTok app open"
    },
    {
        "speaker": "peter",
        "text": "To make it fast, your requests go first through a CDN, a <bold>content delivery network.</bold>",
        "image_description": "A diagram showing the flow of data from a server to a user through a CDN"
    },
    {
        "speaker": "peter",
        "text": "If someone near you watched a video, it gets cached at a nearby server, so when you swipe to watch the same video, it will load much faster.",
        "image_description": "A map showing multiple servers around the world with a user in the center"
    },
    {
        "speaker": "peter",
        "text": "To speed this up even more, they store a single video in multiple different formats, so they can provide you with the most suitable one for your device and internet quality",
        "image_description": "A diagram showing different video formats and their compatibility with different devices"
    },
    {
        "speaker": "stewie",
        "text": "Okay, Peter, but even with all the caching in the world, a video still has to come off <bold>disc</bold> and travel across the <bold>network</bold>. I should feel some delay.",
    },
    {
        "speaker": "peter",
        "text": "You're absolutely right, Stewie. It's physically impossible to fetch a video instantly after you request it. That's why TikTok loads multiple videos the moment you open the app. Everything you're about to see is already halfway or fully loaded.",
        "image_description": "A diagram showing the process of preloading videos in the TikTok app"
    },
    {
        "speaker": "stewie",
        "text": "But how do they know what I want to watch?",
    },
    {
        "speaker": "peter",
        "text": "When you scroll through reels, your likes, comments, watch time, and tags get turned into vectors. Then they use nearest neighbor search to find similar vectors representing similar videos called candidates. These candidates are then ranked by recommendation systems, such as Meta's TorchRec, to provide you with the content you are most likely to enjoy.",
        "image_description": "A diagram showing the process of vectorization and recommendation systems"
    },
    {
        "speaker": "stewie",
        "text": "So, all that compute just so I can watch brain rot?",
    },
    {
        "speaker": "peter",
        "text": "Exactly, Stewie. But it's not just about the videos. It's about the <bold>experience</bold>. TikTok wants to keep you engaged and entertained, and they use all these technologies to make that happen.",
    }
]
```

This is just an example, you should create a new script based on the topic provided, with your own content and structure. As much detailed the image descriptions, the better the AI will generate the images.
Remember to only use the "image_description" field when it is relevant to the text, and to not include any person in the images.
