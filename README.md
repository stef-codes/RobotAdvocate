# RobotLawyer

An AI-powered web application that helps users understand legal documents through automated summarization.

## Features

- Document upload and processing (PDF, DOCX formats)
- AI-powered legal document analysis
- Structured summary generation with key information extraction:
  - Parties involved and their roles
  - Main obligations
  - Important dates
  - Key terms
  - Potential risks with severity levels
- PDF summary export
- Session-based document management

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, ShadcnUI
- **Backend**: Node.js, Express
- **AI Integration**: OpenAI API
- **Document Processing**: pdf-parse, mammoth
- **Storage**: In-memory storage (can be extended to use databases)

## Getting Started

### Prerequisites

- Node.js (v18+)
- OpenAI API key

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/robotlawyer.git
   cd robotlawyer
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5000`

## Usage

1. Upload a legal document (PDF or DOCX format)
2. Wait for the AI to process and analyze the document
3. View the structured summary with key information extracted
4. Export the summary as PDF for later reference

## License

[MIT](LICENSE)

## Acknowledgements

- [OpenAI](https://openai.com/) for providing the AI capabilities
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [TailwindCSS](https://tailwindcss.com/) for the styling framework