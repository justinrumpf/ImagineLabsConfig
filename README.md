# Story Configuration Service

This is a web-based configuration management service for the Imagine Labs story.json file. It provides a user-friendly interface to edit the configuration and commit changes directly to GitHub.

## Features

- **Visual Editor**: Edit all configuration fields through a clean web interface
- **Field Descriptions**: Each field includes helpful descriptions about its purpose
- **Image Upload**: Upload new images for story types and locations
- **Themes Management**: Add/edit themes with age ranges and word counts
- **AI Prompts**: Configure story and image generation prompts with token placeholders
- **GitHub Integration**: Commit changes directly to your GitHub repository
- **Raw JSON Editor**: Edit the configuration directly as JSON for advanced users

## Setup

1. **Install Dependencies**
   ```bash
   cd src/assets/config_service
   npm install
   ```

2. **Configure GitHub Access**
   - Copy `.env.example` to `.env`
   - Create a GitHub Personal Access Token:
     - Go to GitHub Settings > Developer settings > Personal access tokens
     - Generate a new token with `repo` permissions
     - Copy the token to your `.env` file
   
   ```bash
   cp .env.example .env
   # Edit .env with your GitHub token
   ```

3. **Start the Server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

4. **Access the UI**
   Open your browser to: http://localhost:3001

## Usage

### Basic Workflow

1. **Load Configuration**: The service automatically loads the current configuration on startup
2. **Edit Fields**: Navigate through tabs to edit different sections
3. **Save Locally**: Click "Save Locally" to save changes to the local server
4. **Commit to GitHub**: Click "Commit to GitHub" to push changes to the repository

### Configuration Sections

#### Basic Info
- Version number
- Last updated date

#### Step Titles
- Customize the titles shown for each step of story creation
- Each field shows where it appears in the app

#### Themes
- Organize themes by categories
- Set age ranges for appropriate content
- Define word count ranges for each theme
- Add engaging descriptions for AI prompts

#### Story Types
- Define different story genres
- Upload custom images
- Write detailed descriptions for AI generation

#### Locations
- Create time periods/locations
- Add multiple places within each location
- Write vivid descriptions for story settings

#### AI Prompts
- Configure story generation prompts
- Set image generation prompts
- Use token placeholders that get replaced with actual values
- Adjust generation parameters (temperature, token limits)

#### Assets
- View information about asset management
- Upload images through story types and locations tabs

#### Raw JSON
- Direct JSON editing for advanced users
- Format and validate JSON
- Apply changes from raw edits

### Token System

The AI prompts support token replacement. Available tokens:

**Story Generation:**
- `{characters}` - Character names
- `{timePeriod}` - Selected time period
- `{locationName}` - Location name
- `{locationDescription}` - Detailed location description
- `{storyType}` - Story type name
- `{storyTypeDescription}` - Story type description
- `{theme}` - Theme name
- `{themeDescription}` - Theme description
- `{childInfo}` - Child's name and age
- `{wordCount}` - Word count range
- `{ageRange}` - Child's age

**Image Generation:**
- `{title}` - Story title
- `{storyExcerpt}` - Beginning of story
- `{characters}` - Character names
- `{locationName}` - Location name
- `{locationDescription}` - Location description
- `{timePeriod}` - Time period
- `{theme}` - Theme
- `{storyType}` - Story type

## Important Notes

1. **Backup**: Always keep a backup of your configuration before making major changes
2. **Validation**: The service performs basic validation but always test changes in the app
3. **Images**: Uploaded images are stored locally until committed to GitHub
4. **GitHub Sync**: Changes are pushed to the `story.json` file in your configured repository

## Troubleshooting

- **Cannot connect to GitHub**: Check your token has proper permissions
- **Images not uploading**: Ensure the uploads directory has write permissions
- **Changes not appearing in app**: The app caches configuration; force refresh or wait for cache expiry

## Security

- Never commit your `.env` file
- Keep your GitHub token secure
- This service should only be run locally or on a secure server