# Embedded Player Documentation

The embedded player allows you to embed Radio TLIS shows and episodes on any website using iframes.

## Usage

### 1. Embed a Show Info Card

Display show information with cover, title, hosts, and description:

```html
<iframe 
  src="https://tlis.sk/embedded?type=show&slug=pingpong" 
  width="100%" 
  height="300" 
  frameborder="0" 
  allowfullscreen>
</iframe>
```

**Parameters:**
- `type=show` - Display show information only
- `slug=SHOW_SLUG` - Replace with the show's slug (e.g., `vinylove-pisnicky`)

**Example:**
```html
<iframe 
  src="https://tlis.sk/embedded?type=show&slug=vinylove-pisnicky" 
  width="100%" 
  height="300" 
  frameborder="0">
</iframe>
```

---

### 2. Embed Episode List for a Show

Display a scrollable list of episodes with playback functionality:

```html
<iframe 
  src="https://tlis.sk/embedded?type=episodes&slug=SHOW_SLUG" 
  width="100%" 
  height="600" 
  frameborder="0" 
  allowfullscreen>
</iframe>
```

**Parameters:**
- `type=episodes` - Display episode list with player
- `slug=SHOW_SLUG` - Replace with the show's slug

**Features:**
- Play/pause episodes directly
- Tag filtering
- Expandable descriptions
- Share functionality
- View counts

**Example:**
```html
<iframe 
  src="https://tlis.sk/embedded?type=episodes&slug=vinylove-pisnicky" 
  width="100%" 
  height="600" 
  frameborder="0">
</iframe>
```

---

### 3. Embed a Single Episode

Display a single episode with a modern card design and playback controls:

```html
<iframe 
  src="https://tlis.sk/embedded?type=episode&id=EPISODE_ID" 
  width="100%" 
  height="500" 
  frameborder="0" 
  allowfullscreen>
</iframe>
```

**Parameters:**
- `type=episode` - Display single episode
- `id=EPISODE_ID` - Replace with the episode's numeric ID

**Features:**
- Large cover image
- Play/pause controls
- Episode metadata
- Share functionality
- Media session integration

**Example:**
```html
<iframe 
  src="https://tlis.sk/embedded?type=episode&id=123" 
  width="100%" 
  height="500" 
  frameborder="0">
</iframe>
```

---

## Recommended Dimensions

### Show Info Card
- Width: 100% or minimum 400px
- Height: 250-350px

### Episode List
- Width: 100% or minimum 600px
- Height: 600-800px (allows scrolling)

### Single Episode
- Width: 100% or minimum 400px
- Height: 450-550px

---

## Styling Notes

- The embedded player has a **transparent background** and works on any page background
- Uses modern **gradient cards** with backdrop blur effects
- Fully **responsive** design
- **Dark theme** optimized for TLIS branding
- Smooth animations and transitions

---

## Cross-Origin Support

The embedded player is configured to work across all domains:
- CORS headers are properly set
- X-Frame-Options allows embedding
- Media session API for OS-level controls

---

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive
- Touch-friendly controls
- Media session support where available

---

## Example Integration

```html
<!DOCTYPE html>
<html>
<head>
  <title>Radio TLIS Embedded Player</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      background: #1a1a1a;
      font-family: Arial, sans-serif;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      color: #d43c4a;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Najnovšie Epizódy</h1>
    
    <!-- Embed episode list -->
    <iframe 
      src="https://tlis.sk/embedded?type=episodes&slug=vinylove-pisnicky" 
      width="100%" 
      height="600" 
      frameborder="0"
      style="border-radius: 12px;">
    </iframe>
  </div>
</body>
</html>
```

---

## Notes

- All URLs should use HTTPS for security
- The player respects user's audio preferences
- View counts are tracked after 5 minutes of playback
- Share functionality uses native share API when available
