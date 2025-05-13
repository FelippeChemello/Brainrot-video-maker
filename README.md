# Dialogue to Video Generator

This project generates dynamic videos depicting a conversation. It takes a script with speaker information, audio details, and optional images, and combines it with configurable background video or color schemes to produce a final video output.

## Features

*   Generates videos from script files.
*   Supports two speakers in a conversation.
*   Customizable backgrounds (video or solid color).
*   Text-to-Speech integration using ElevenLabs.
*   Image generation based on script content (via Gemini).
*   Audio alignment for synchronized speech and visuals.
*   Built with Remotion for programmatic video creation.

## Getting Started

### Prerequisites

*   Node.js and pnpm
*   Access to ElevenLabs API (for TTS)
*   Access to Google Gemini API (for image generation)

### Installation

1.  Clone the repository:
    ```bash
    git clone <your-repository-url>
    cd codestack-videos
    ```
2.  Install dependencies:
    ```bash
    pnpm install
    ```
3.  Set up your environment variables. Create a `.env` file in the root of the project and add your API keys:
    ```sh
    ELEVENLABS_API_KEY=your_elevenlabs_api_key
    GEMINI_API_KEY=your_gemini_api_key

    # Check https://github.com/FelippeChemello/modal_aeneas for details on how to set up Aeneas
    AENEAS_API_KEY=your_aeneas_api_key
    AENEAS_BASE_URL=your_aeneas_base_url
    ```

## Usage

1.  Prepare your script in `script.json` at the root. 
    ```json
    [
        {
            "speaker": "Felippe",
            "text": "Hello, how are you?",
            "image_description": "A friendly person waving"
        },
        {
            "speaker": "Cody",
            "text": "I'm good, thanks! How about you?",
            "image_description": "A person smiling"
        }
    ]
    ```
2.  Run the development script to generate the video:
    ```bash
    pnpm dev
    ```
3.  To preview the video composition in Remotion:
    ```bash
    pnpm remotion-preview
    ```
    Then open the link provided in your browser.
4.  To build the video for production:
    ```bash
    pnpm remotion render src/video/index.ts <Portrait|Landscape>
    ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
Feel free to suggest features or report bugs.
