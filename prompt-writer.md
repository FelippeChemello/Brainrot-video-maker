Your task is to create a script for a video about the topic provided below. The script should be in the format of a conversation between two characters, Felippe and Cody. Felippe is the knowledgeable one who provides detailed explanations, while Cody is the curious one who asks questions. The script should be engaging, informative, and easy to understand, with a friendly tone.

The script should be provided as a conversation between two person named Felippe (The smart one, who answers the questions) and Cody (The curious one, who makes questions)

The output must be a JSON with the following structure
```typescript
type Script = {
    title: string; // The title of the video in less than 5 words
    segments: Array<{
        speaker: 'Felippe' | 'Cody'; 
        text: string; // The text should be in Portuguese language
        image_description?: string; // A description of the image that will be used in this part of the video to illustrate the text, it will be used as a prompt for an AI image generator. The image should not contain any person, must be only illustrative and related to the text (optional, in English language)
    }>
```

In the script, Felippe should provide detailed, deep and technical explanations, while Cody should ask questions that are more general and easy to understand. The script should be engaging and informative, with a friendly tone and deep explanations. 

It's very important that each part of the script is detailed and informative, with a clear explanation of the topic. The script should also be engaging and easy to understand. Also, it must be written in a way that is easy to read and follow, since it will be directly used as Text-to-Speech for a video without any human intervention or corrections.

You can make many segments of the script with the same speaker, splitting them into smaller parts if necessary, with image descriptions that are relevant to the text to make the video more engaging.

Here are some examples of how the script should look like, keep the same structure, format, voice and tone, but change the content to match the topic provided:
```json
{
    "title": "How does TikTok work?",
    "segments": [
        {
            "speaker": "stewie",
            "text": "Peter, how does TikTok store billions of videos and load them so fast?",
            "image_description": "Tiktok logo"
        },
        {
            "speaker": "peter",
            "text": "They store videos in object storage like S3 or GCS.",
            "image_description": "AWS S3 logo and Google Cloud Storage logo"
        },
        {
            "speaker": "peter",
            "text": "These systems lack the complex query capabilities of regular databases, but are optimized for storing massive amount of files durably and fast access times.",
            "image_description": "A data center with many servers"
        },
        {
            "speaker": "stewie",
            "text": "Okay, that explains the storage, but how do they load so fast?",
            "image_description": "A person using a smartphone with TikTok app open"
        },
        {
            "speaker": "peter",
            "text": "To make it fast, your requests go first through a CDN, a content delivery network.",
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
            "text": "Okay, Peter, but even with all the caching in the world, a video still has to come off disc and travel across the network. I should feel some delay."
        },
        {
            "speaker": "peter",
            "text": "You're absolutely right, Stewie. It's physically impossible to fetch a video instantly after you request it. That's why TikTok loads multiple videos the moment you open the app. Everything you're about to see is already halfway or fully loaded.",
            "image_description": "A diagram showing the process of preloading videos in the TikTok app"
        },
        {
            "speaker": "stewie",
            "text": "But how do they know what I want to watch?"
        },
        {
            "speaker": "peter",
            "text": "When you scroll through reels, your likes, comments, watch time, and tags get turned into vectors. Then they use nearest neighbor search to find similar vectors representing similar videos called candidates. These candidates are then ranked by recommendation systems, such as Meta's TorchRec, to provide you with the content you are most likely to enjoy.",
            "image_description": "A diagram showing the process of vectorization and recommendation systems"
        },
        {
            "speaker": "stewie",
            "text": "So, all that compute just so I can watch brain rot?"
        },
        {
            "speaker": "peter",
            "text": "Exactly, Stewie. But it's not just about the videos. It's about the experience. TikTok wants to keep you engaged and entertained, and they use all these technologies to make that happen."
        }
    ]
}
```

Another example:
```json
{
    "title": "How to build a massive chat APP like WhatsApp?",
    "segments": [
        {
            "speaker": "stewie",
            "text": "Peter, how would you build a massive chat app like WhatsApp? I don't know where to start.",
            "image_description": "WhatsApp logo"
        },
        {
            "speaker": "peter",
            "text": "Start with WebSockets. Real time needs a persistent connection and WebSockets let you send and receive messages instantly.",
            "image_description": "A diagram showing WebSocket connection"
        },
        {
            "speaker": "stewie",
            "text": "All right. What about backend? What's your stack?"
        },
        {
            "speaker": "peter",
            "text": "You could go with Go, Rust, or Java, but I will use Elixir with Phoenix Framework.",
            "image_description": "A logo of Elixir programming language and Phoenix Framework"
        },
        {
            "speaker": "peter",
            "text": "It runs on the Erlang VM, same thing WhatsApp uses. Elixir has built-in pub/sub, distributed state and automatic recovery, all of which are essential for chat apps."
        },
        {
            "speaker": "stewie",
            "text": "And the database?"
        },
        {
            "speaker": "peter",
            "text": "Start with PostgreSQL. It's fast and simple. Once you have a large user base, switch to something like Google Spanner or Cassandra for high write throughput.",
            "image_description": "PostgreSQL logo with an arrow pointing to Google Spanner and Cassandra logos"
        },
        {
            "speaker": "stewie",
            "text": "This all sounds very complex. What if I do not know anything about backend?"
        },
        {
            "speaker": "peter",
            "text": "Then use Firebase. It gives you WebSockets, auth, and a database all in one. Great for small to medium apps, but you'll need a custom backend if you're going big.",
            "image_description": "Firebase logo"
        },
        {
            "speaker": "stewie",
            "text": "Got it. WebSockets for real-time, Elixir for backend, PostgreSQL for database, and Firebase for simplicity. Clean and Scalable."
        },
        {
            "speaker": "peter",
            "text": "Exactly! Follow for more dev breakdowns like this and drop your next tech topic in the comments!"
        }
    ]
}
```

Another example:
```json
{
    "title": "How Apple FaceID works?",
    "segments": [
        {
            "speaker": "stewie",
            "text": "Peter, how does my iPhone's face ID recognize me after taking just one photo of me?",
            "image_description": "Apple FaceID logo"
        },
        {
            "speaker": "peter",
            "text": "Actually, Stewie, it doesn't take a regular photo at all. Instead, it builds a detailed 3D map of your face, making it much more secure than a simple 2D image.",
            "image_description": "3D map of a face with facial features highlighted"
        },
        {
            "speaker": "stewie",
            "text": "A 3D map? Sounds impressive! How exactly does that work?"
        },
        {
            "speaker": "peter",
            "text": "Your iPhone uses something called a TrueDepth camera system. When you look at your phone, it projects about 30000 invisible infrared dots onto your face using a dot projector. An infrared camera then reads how those dots distort around your unique facial shape, creating a precise 3D map.",
            "image_description": "A diagram showing the TrueDepth camera system with a phone projecting dots onto a face"
        },
        {
            "speaker": "peter",
            "text": "After building this map, it's compared with the stored original using an on-device neural network. If there's a high enough confidence score, your phone unlocks. That's why FaceID is extremely secure against photos, videos and even realistic masks."
        },
        {
            "speaker": "stewie",
            "text": "Fascinating! But how does it still work so flawlessly in complete darkness?"
        },
        {
            "speaker": "peter",
            "text": "Great question! It uses what's called a food illuminator, an infrared light source that evenly illuminates you face, even in total darkness. This ensures the dot projection and infrared camera can accurately see and map your face regardless of lighting conditions."
        },
        {
            "speaker": "stewie",
            "text": "Incredible! But what if I start growing a beard of change my glasses?"
        },
        {
            "speaker": "peter",
            "text": "FaceID continuously learns and adapts. When your face slightly changes, like growing a beard or switching glasses, FaceID updates your stored facial template after successful unlocks. Even if recognition fails temporarily, entering your passcode helps the system update your facial reference data, with your consent, of course."
        },
        {
            "speaker": "stewie",
            "text": "But what if someone hacks into my phone's memory and steals that facial data?"
        },
        {
            "speaker": "peter",
            "text": "Apple thought of that too. Your face ID data isn't stored in regular memory. It's safely encrypted and locked away in the Secure Enclave, a separate isolated security chip inside your iPhone. Even Apple itself can't access it, allegedly, making your biometric data extremely secure.",
            "image_description": "A diagram showing the Secure Enclave chip inside an iPhone"
        },
        {
            "speaker": "stewie",
            "text": "Thanks, Peter. Can't believe all this sophisticated tech happens just so I can unlock my phone."
        },
        {
            "speaker": "peter",
            "text": "Yep. Makes you appreciate your selfies a bit more, doesn't it, Stewie?"
        }
    ]
}
```

These are just examples, you should create a new script based on the topic provided, with your own content and structure. As much detailed the image descriptions, the better the AI will generate the images.

<attention>
Remember that "image_description" is optional and should only be presented in the segment when it is relevant to the text and strictly necessary (it costs a lot), and to not include any person in the images.
The final video should be at least 7 minutes long!
Provide a valid JSON without trailing commas, and ensure that the JSON is well-formed and valid.
The first speaker should always be Cody, starting with a question or a statement that introduces the topic.
</attention>

<topic>
    
</topic>