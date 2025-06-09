# PhysioRoutine - Physiotherapy Exercise App

A comprehensive Progressive Web App (PWA) designed to assist physiotherapy patients with personalized exercise routines, guided instructions, and progress tracking.

## Features

### 🏃‍♂️ Core Functionality
- **Routine Creation**: Build custom exercise routines with personalized settings
- **Exercise Library**: Curated collection of common physiotherapy exercises
- **Guided Playback**: Step-by-step routine execution with visual and audio guidance
- **Progress Tracking**: Monitor your exercise history and maintain streaks
- **Offline Support**: Full functionality without internet connectivity

### 📱 Progressive Web App
- **Installable**: Works as a native app on mobile and desktop
- **Offline-First**: Uses IndexedDB for local data storage
- **Responsive Design**: Optimized for all screen sizes
- **Touch-Friendly**: Mobile-optimized interface

### ♿ Accessibility Features
- **Screen Reader Support**: ARIA labels and announcements
- **Keyboard Navigation**: Full keyboard accessibility
- **High Contrast**: Clear visual design
- **Text-to-Speech**: Audio exercise instructions

## Technology Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Storage**: IndexedDB for offline data persistence
- **PWA**: Service Worker, Web App Manifest
- **Styling**: Modern CSS with Flexbox/Grid
- **Icons**: Placeholder images (replace with actual exercise images)

## File Structure

```
physio-routine-app/
├── index.html          # Main HTML file with app structure
├── styles.css          # Complete CSS styling with responsive design
├── script.js           # Main JavaScript application logic
├── manifest.json       # PWA manifest for installation
├── sw.js              # Service worker for offline functionality
└── README.md          # This documentation file
```

## Quick Start

### 1. Download Files
Create a new folder and save all the provided files:
- `index.html`
- `styles.css` 
- `script.js`
- `manifest.json`
- `sw.js`

### 2. Local Development
For local testing, you need to serve the files via HTTP (not file://) due to service worker requirements:

**Option A: Using Python**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Option B: Using Node.js**
```bash
npx http-server .
```

**Option C: Using PHP**
```bash
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

### 3. Deploy to Production

#### Netlify (Recommended)
1. Create account at [netlify.com](https://netlify.com)
2. Drag and drop your project folder to Netlify dashboard
3. Your app will be live instantly with HTTPS

#### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Follow the prompts

#### GitHub Pages
1. Create GitHub repository
2. Upload files to repository
3. Enable GitHub Pages in repository settings
4. Choose source as main branch

#### Manual Hosting
Upload all files to any web hosting service that supports:
- Static file hosting
- HTTPS (required for PWA features)
- Custom domains (optional)

## Configuration

### Exercise Images
Replace placeholder images with actual exercise demonstration images:
- Update image URLs in `script.js` exercise database
- Ensure images are optimized for web (WebP recommended)
- Maintain aspect ratio of 300x200 for consistency

### Customization Options

#### Colors & Branding
Edit CSS variables in `styles.css`:
```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --error-color: #ef4444;
}
```

#### Exercise Database
Add/modify exercises in `script.js`:
```javascript
const exercises = [
  {
    id: 'exercise-id',
    name: 'Exercise Name',
    description: 'Exercise description',
    image: '/path/to/image.jpg',
    category: 'Category',
    defaultReps: 10,
    defaultSets: 3,
    defaultRestTime: 30,
    instructions: 'Detailed instructions...',
    benefits: ['Benefit 1', 'Benefit 2'],
    difficulty: 'Beginner'
  }
];
```

## Browser Support

### Required Features
- IndexedDB (for offline storage)
- Service Workers (for PWA functionality)
- Modern JavaScript (ES6+)
- CSS Grid and Flexbox

### Supported Browsers
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ⚠️ IE: Not supported

### Mobile Support
- ✅ iOS Safari 13+
- ✅ Chrome Mobile 80+
- ✅ Samsung Internet 12+

## Features Breakdown

### 1. Routine Management
- Create custom routines with multiple exercises
- Set repetitions, sets, and rest times for each exercise
- Edit and delete existing routines
- Duplicate routines for variations

### 2. Exercise Execution
- **Visual Guidance**: Exercise images and descriptions
- **Timer System**: Automatic rest period timing
- **Progress Tracking**: Real-time progress indicators
- **Audio Cues**: Text-to-speech instructions (optional)
- **Navigation**: Skip, repeat, or pause exercises

### 3. Progress Analytics
- **Session History**: Track completed routines
- **Streak Counter**: Monitor consecutive active days
- **Weekly Statistics**: View recent activity
- **Export Data**: Download progress for external analysis

### 4. Offline Capabilities
- **Full Offline Mode**: All features work without internet
- **Data Persistence**: Routines and progress saved locally
- **Automatic Sync**: Data syncs when connection returns
- **Cached Assets**: Images and resources stored locally

## Development

### Adding New Exercises
1. Add exercise object to the exercises array in `script.js`
2. Include high-quality demonstration image
3. Provide clear instructions and benefits
4. Test the exercise in the routine builder

### Extending Functionality
The app is built with modularity in mind:

- **Database Layer**: Modify IndexedDB operations in the `PhysioApp` class
- **UI Components**: Add new screens by creating tab content sections
- **Exercise Types**: Extend the exercise object schema
- **Analytics**: Add new progress metrics to the tracking system

### API Integration (Optional)
To connect with a backend service:

1. **User Authentication**: Add login/signup functionality
2. **Cloud Sync**: Implement routine and progress synchronization
3. **Exercise Videos**: Stream exercise demonstrations
4. **Community Features**: Share routines with other users

## Security & Privacy

### Data Storage
- All data stored locally in browser's IndexedDB
- No personal information sent to external servers
- Users have full control over their data

### Permissions
- **Storage**: Used for offline functionality
- **Notifications**: Optional routine reminders
- **Camera**: Not used (placeholder for future features)

## Performance Optimization

### Implemented Optimizations
- **Lazy Loading**: Images loaded on demand
- **Service Worker Caching**: Static assets cached for offline use
- **Debounced Inputs**: Reduced unnecessary database operations
- **Optimized CSS**: Minimal reflows and repaints
- **Compressed Assets**: Minified code for production

### Further Optimizations
- Implement virtual scrolling for large exercise lists
- Add progressive image loading
- Use CSS containment for performance
- Consider WebAssembly for complex calculations

## Troubleshooting

### Common Issues

#### Service Worker Not Registering
- Ensure files are served over HTTPS (or localhost)
- Check browser console for registration errors
- Clear browser cache and reload

#### IndexedDB Not Working
- Check browser compatibility
- Ensure sufficient storage space
- Verify no private/incognito mode restrictions

#### PWA Installation Not Available
- Confirm HTTPS deployment
- Verify manifest.json is accessible
- Check that service worker is registered
- Ensure minimum PWA requirements are met

#### Images Not Loading
- Verify image URLs are correct
- Check network connectivity
- Ensure images are properly cached

### Browser Developer Tools
Use browser dev tools to debug:
- **Application Tab**: Check service worker and storage
- **Network Tab**: Monitor request/response cycles
- **Console Tab**: View error messages and logs
- **Performance Tab**: Analyze app performance

## Contributing

### Code Style
- Use meaningful variable names
- Add comments for complex logic
- Follow existing indentation patterns
- Test changes across different browsers

### Testing Checklist
- [ ] App loads on mobile and desktop
- [ ] Offline functionality works
- [ ] Service worker updates correctly
- [ ] All user interactions respond appropriately
- [ ] Data persists between sessions
- [ ] PWA installation works

## License

This project is open source and available under the MIT License.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Test in different browsers to isolate issues
4. Ensure all files are properly uploaded/configured

## Roadmap

### Planned Features
- **Video Integration**: Exercise demonstration videos
- **Voice Commands**: Hands-free routine control
- **Wearable Integration**: Smartwatch compatibility
- **Social Features**: Share routines with friends
- **Advanced Analytics**: Detailed progress insights
- **Therapist Portal**: Professional routine management
- **Multi-language Support**: Internationalization
- **Dark Mode**: Alternative theme option

### Version History
- **v1.0.0**: Initial release with core functionality
- **v1.1.0** (Planned): Video integration and enhanced UI
- **v1.2.0** (Planned): Social features and cloud sync
- **v2.0.0** (Planned): Therapist portal and advanced analytics

## Adding Exercise Images

The app uses images to demonstrate exercises. To add your exercise images:

1. Place your exercise images in the `/exercises/images/` directory
2. Use the following naming convention for your images:
   - hamstring-stretch.jpg
   - piriformis-stretch.jpg
   - standing-hip-flexor.jpg
   - straight-leg-raise.jpg
   - bridge.jpg
   - clamshells.jpg
   - cervical-retraction.jpg
   - thoracic-extension.jpg
   - lumbar-extension.jpg

Image Requirements:
- Format: JPG or JPEG
- Recommended size: 1280x720 pixels
- File size: Optimize for web (recommended under 200KB per image)
- Content: Clear, well-lit photos showing the exercise in progress
- Style: Consistent background and lighting across all images
- For each exercise, provide two images:
  1. Starting position
  2. End position or movement in progress

The images will be automatically cached by the service worker for offline use.

---

**Built with ❤️ for physiotherapy patients and healthcare professionals**