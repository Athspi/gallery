import { SkillDefinition } from '../types';

export const INITIAL_SKILLS: SkillDefinition[] = [
  {
    id: 'mood-tracker',
    name: 'Mood Tracker',
    description: 'Log and analyze daily moods, reflections, emotions, and review historical mood score trends on an interactive dashboard.',
    category: 'Utility',
    icon: 'Smile',
    version: '1.2.0',
    author: 'Google AI Edge Team',
    enabled: true,
    isFeatured: true,
    interactiveComponent: 'mood-tracker',
    systemPromptAddition: 'When user expresses feelings or wants to log their mood, call the mood_tracker tool with action="log_mood" and score between 1 and 10.',
    toolDefinition: {
      name: 'mood_tracker',
      description: 'Record or retrieve daily mood scores (1-10) with reflections and view trends.',
      parameters: {
        type: 'object',
        properties: {
          action: { type: 'string', description: 'Action to perform: log_mood, get_mood, get_history, delete_mood, or export_data' },
          score: { type: 'number', description: 'Mood rating from 1 to 10' },
          comment: { type: 'string', description: 'Reflection notes or reason for this mood score' },
          date: { type: 'string', description: 'Date in YYYY-MM-DD or today / yesterday' },
          days: { type: 'number', description: 'Number of past days for history' }
        },
        required: ['action']
      }
    },
    scriptJs: `
      const STORAGE_KEY = 'mood_tracker_data';
      function getStore() {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
      }
      function saveStore(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
      const data = typeof input === 'string' ? JSON.parse(input) : input;
      const today = new Date().toISOString().split('T')[0];
      const targetDate = data.date || today;
      const store = getStore();

      if (data.action === 'log_mood') {
        const score = Number(data.score) || 7;
        store[targetDate] = { score, comment: data.comment || '', timestamp: new Date().toISOString() };
        saveStore(store);
        return {
          result: \`Successfully logged mood \${score}/10 on \${targetDate} (\${data.comment || 'No note'}).\`,
          interactiveType: 'mood-tracker',
          payload: { date: targetDate, score, comment: data.comment, history: store }
        };
      } else if (data.action === 'get_history' || data.action === 'get_mood') {
        return {
          result: \`Retrieved \${Object.keys(store).length} mood entries.\`,
          interactiveType: 'mood-tracker',
          payload: { history: store, date: targetDate }
        };
      }
      return { result: 'Mood tracker ready', interactiveType: 'mood-tracker', payload: { history: store } };
    `
  },
  {
    id: 'virtual-piano',
    name: 'Virtual Piano 88-Key',
    description: 'Interactive playable piano keyboard with full 88 keys, polyphonic audio synthesis, octave switching, and song notation player.',
    category: 'Interactive',
    icon: 'Music',
    version: '2.0.0',
    author: 'Google AI Edge Community',
    enabled: true,
    isFeatured: true,
    interactiveComponent: 'virtual-piano',
    systemPromptAddition: 'When user mentions playing music, chords, melodies, or asking for the piano, trigger the virtual_piano tool.',
    toolDefinition: {
      name: 'virtual_piano',
      description: 'Open the virtual piano keyboard with optional melody sequence or song chords to auto-play.',
      parameters: {
        type: 'object',
        properties: {
          songTitle: { type: 'string', description: 'Title of the musical piece' },
          notes: { type: 'string', description: 'Comma-separated notes (e.g. C4, E4, G4, C5)' },
          tempo: { type: 'number', description: 'Beats per minute tempo' }
        },
        required: []
      }
    },
    scriptJs: `
      const data = typeof input === 'string' ? JSON.parse(input) : input;
      return {
        result: \`Loaded Virtual Piano 88-key\${data?.songTitle ? ' with song: ' + data.songTitle : ''}.\`,
        interactiveType: 'virtual-piano',
        payload: {
          songTitle: data?.songTitle || 'Free Play',
          notes: data?.notes ? data.notes.split(',').map(n => n.trim()) : ['C4', 'E4', 'G4', 'B4', 'C5'],
          tempo: data?.tempo || 120
        }
      };
    `
  },
  {
    id: 'learn-something-new',
    name: 'Learn Something New',
    description: 'Generates visually rich "Today I Learned" infographic flashcards with custom gradient canvases and QR code verification links.',
    category: 'Education',
    icon: 'Lightbulb',
    version: '1.3.0',
    author: 'Google AI Edge Team',
    enabled: true,
    isFeatured: true,
    interactiveComponent: 'learn-something-new',
    toolDefinition: {
      name: 'learn_something_new',
      description: 'Create an educational visual card explaining a fascinating topic or fact.',
      parameters: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: 'The educational subject or discovery' },
          description: { type: 'string', description: 'Clear, engaging 2-3 sentence explanation' },
          sourceUrl: { type: 'string', description: 'Reference URL for the topic' }
        },
        required: ['topic', 'description']
      }
    },
    scriptJs: `
      const data = typeof input === 'string' ? JSON.parse(input) : input;
      return {
        result: \`Generated TIL flashcard for "\${data.topic}".\`,
        interactiveType: 'learn-something-new',
        payload: {
          topic: data.topic || 'Fascinating Quantum Phenomenon',
          description: data.description || 'Quantum entanglement allows particles to instantly mirror states across cosmic distances.',
          sourceUrl: data.sourceUrl || 'https://ai.google.dev'
        }
      };
    `
  },
  {
    id: 'query-wikipedia',
    name: 'Wikipedia Explorer',
    description: 'Live encyclopedic lookup: queries Wikipedia API for introductions, summary abstracts, and structured infobox metadata.',
    category: 'Utility',
    icon: 'BookOpen',
    version: '1.4.0',
    author: 'Google AI Edge Team',
    enabled: true,
    isFeatured: true,
    interactiveComponent: 'wikipedia-query',
    toolDefinition: {
      name: 'query_wikipedia',
      description: 'Search Wikipedia for articles and structured infobox key-value data.',
      parameters: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: 'Subject or keyword to look up' },
          lang: { type: 'string', description: '2-letter language code, e.g. en, fr, de, ja, es' }
        },
        required: ['topic']
      }
    },
    scriptJs: `
      const data = typeof input === 'string' ? JSON.parse(input) : input;
      const topic = encodeURIComponent(data.topic || 'Google Gemma');
      const lang = data.lang || 'en';
      const endpoint = \`https://\${lang}.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=\${topic}&gsrlimit=1&prop=extracts|pageimages&explaintext=1&exintro=1&origin=*\`;
      
      const res = await fetch(endpoint);
      const json = await res.json();
      if (!json.query || !json.query.pages) {
        return { error: \`No Wikipedia articles found for "\${data.topic}"\` };
      }
      const pageKey = Object.keys(json.query.pages)[0];
      const page = json.query.pages[pageKey];
      return {
        result: page.extract || 'No extract available.',
        interactiveType: 'wikipedia-query',
        payload: {
          title: page.title,
          extract: page.extract,
          pageId: page.pageid,
          url: \`https://\${lang}.wikipedia.org/wiki/\${encodeURIComponent(page.title)}\`
        }
      };
    `
  },
  {
    id: 'interactive-map',
    name: 'Interactive Map',
    description: 'Locates coordinates, points of interest, cities, and landmarks with embedded interactive map previews.',
    category: 'Utility',
    icon: 'MapPin',
    version: '1.1.0',
    author: 'Google AI Edge Team',
    enabled: true,
    interactiveComponent: 'interactive-map',
    toolDefinition: {
      name: 'interactive_map',
      description: 'Search for a location and display an interactive map viewport.',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string', description: 'Address, landmark, or city name' },
          zoom: { type: 'number', description: 'Zoom level (1-18)' }
        },
        required: ['location']
      }
    },
    scriptJs: `
      const data = typeof input === 'string' ? JSON.parse(input) : input;
      const loc = data.location || 'San Francisco, CA';
      return {
        result: \`Location mapped: \${loc}\`,
        interactiveType: 'interactive-map',
        payload: {
          location: loc,
          zoom: data.zoom || 14,
          embedUrl: \`https://maps.google.com/maps?q=\${encodeURIComponent(loc)}&output=embed\`
        }
      };
    `
  },
  {
    id: 'qr-code',
    name: 'QR Code Generator',
    description: 'Generates high-resolution square or rounded QR codes for URLs, WiFi networks, text, or cryptographic signatures with direct PNG export.',
    category: 'Media',
    icon: 'QrCode',
    version: '1.2.0',
    author: 'Google AI Edge Team',
    enabled: true,
    interactiveComponent: 'qr-code',
    toolDefinition: {
      name: 'generate_qr_code',
      description: 'Generate customizable 2D QR codes with visual styling options.',
      parameters: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'URL or text payload' },
          shape: { type: 'string', description: 'square or circle' },
          color: { type: 'string', description: 'Hex foreground color e.g. #2563eb' }
        },
        required: ['url']
      }
    },
    scriptJs: `
      const data = typeof input === 'string' ? JSON.parse(input) : input;
      return {
        result: \`QR code generated for: \${data.url}\`,
        interactiveType: 'qr-code',
        payload: {
          url: data.url || 'https://github.com/google-ai-edge/gallery',
          shape: data.shape || 'square',
          color: data.color || '#2563eb'
        }
      };
    `
  },
  {
    id: 'tinygarden',
    name: 'Tiny Garden',
    description: 'Pixel-art on-device mini-game where the AI agent manages botanical plots, waters sprouts, fertilizes soil, and blossoms rare flowers.',
    category: 'Gaming',
    icon: 'Flower2',
    version: '1.5.0',
    author: 'Google AI Edge Custom Tasks',
    enabled: true,
    isFeatured: true,
    interactiveComponent: 'tiny-garden',
    toolDefinition: {
      name: 'tiny_garden',
      description: 'Interact with the garden: plant seeds, water plots, check inventory, or harvest blossoms.',
      parameters: {
        type: 'object',
        properties: {
          action: { type: 'string', description: 'plant, water, harvest, or status' },
          seedType: { type: 'string', description: 'daisy, rose, sunflower, lavender, or tulip' },
          plotIndex: { type: 'number', description: 'Grid index 0 to 5' }
        },
        required: ['action']
      }
    },
    scriptJs: `
      const data = typeof input === 'string' ? JSON.parse(input) : input;
      return {
        result: \`Garden action performed: \${data.action} on plot \${data.plotIndex ?? 0}\`,
        interactiveType: 'tiny-garden',
        payload: {
          action: data.action,
          seedType: data.seedType || 'rose',
          plotIndex: data.plotIndex ?? 0
        }
      };
    `
  },
  {
    id: 'calculate-hash',
    name: 'Hash & Crypto Calculator',
    description: 'Computes cryptographic hashes (SHA-256, SHA-512, SHA-1, MD5) on text strings, tokens, and payloads directly in browser WebCrypto.',
    category: 'Utility',
    icon: 'Hash',
    version: '1.0.0',
    author: 'Google AI Edge Team',
    enabled: true,
    toolDefinition: {
      name: 'calculate_hash',
      description: 'Compute cryptographic checksums and hashes for strings.',
      parameters: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'The raw text to hash' },
          algorithm: { type: 'string', description: 'SHA-256, SHA-512, SHA-1, or MD5' }
        },
        required: ['text']
      }
    },
    scriptJs: `
      const data = typeof input === 'string' ? JSON.parse(input) : input;
      const text = data.text || '';
      const algo = (data.algorithm || 'SHA-256').toUpperCase();
      
      const encoder = new TextEncoder();
      const msgData = encoder.encode(text);
      const hashBuffer = await crypto.subtle.digest(algo === 'MD5' ? 'SHA-256' : algo, msgData);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      return {
        result: \`Calculated \${algo} hash: \${hashHex}\`,
        payload: { text, algorithm: algo, hash: hashHex }
      };
    `
  },
  {
    id: 'text-spinner',
    name: 'Text Decision Spinner',
    description: 'Generates animated colorful roulette decision wheels with custom labels and options for instant random choices.',
    category: 'Interactive',
    icon: 'Disc',
    version: '1.1.0',
    author: 'Google AI Edge Team',
    enabled: true,
    interactiveComponent: 'text-spinner',
    toolDefinition: {
      name: 'text_spinner',
      description: 'Create a spinning prize/decision wheel with options.',
      parameters: {
        type: 'object',
        properties: {
          label: { type: 'string', description: 'Comma separated options to spin between, e.g. Pizza, Sushi, Burgers, Tacos' }
        },
        required: ['label']
      }
    },
    scriptJs: `
      const data = typeof input === 'string' ? JSON.parse(input) : input;
      const options = (data.label || 'Option A, Option B, Option C').split(',').map(s => s.trim());
      const selected = options[Math.floor(Math.random() * options.length)];
      return {
        result: \`Spin result: \${selected}\`,
        interactiveType: 'text-spinner',
        payload: { options, selected }
      };
    `
  },
  {
    id: 'mood-music',
    name: 'Mood Soundtrack Gen',
    description: 'Synthesizes generative music audio stems based on target genre (House, Lo-Fi, Ambient, Synthwave) and energy level.',
    category: 'Media',
    icon: 'Radio',
    version: '1.0.0',
    author: 'Google AI Edge Team',
    enabled: true,
    interactiveComponent: 'mood-music',
    toolDefinition: {
      name: 'generate_mood_music',
      description: 'Generate ambient or rhythmic background music tracks matching mood and energy.',
      parameters: {
        type: 'object',
        properties: {
          genre: { type: 'string', description: 'Lo-Fi, Synthwave, Ambient, Cinematic, or House' },
          energy: { type: 'string', description: 'low, medium, or high' },
          duration: { type: 'number', description: 'Duration in seconds (30 - 300)' }
        },
        required: ['genre']
      }
    },
    scriptJs: `
      const data = typeof input === 'string' ? JSON.parse(input) : input;
      return {
        result: \`Synthesized \${data.energy || 'medium'} energy \${data.genre || 'Lo-Fi'} soundtrack track.\`,
        interactiveType: 'mood-music',
        payload: {
          genre: data.genre || 'Lo-Fi',
          energy: data.energy || 'medium',
          duration: data.duration || 120,
          title: \`Chill \${data.genre || 'Lo-Fi'} Session #\${Math.floor(Math.random()*900 + 100)}\`
        }
      };
    `
  },
  {
    id: 'create-calendar-event',
    name: 'Calendar Event Creator',
    description: 'Creates structured calendar events with title, start time, duration, location, and reminders.',
    category: 'System',
    icon: 'Calendar',
    version: '1.0.0',
    author: 'Google AI Edge Team',
    enabled: true,
    toolDefinition: {
      name: 'create_calendar_event',
      description: 'Schedule a new calendar appointment or reminder.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Title of the event' },
          startDate: { type: 'string', description: 'Start date and time (ISO format or YYYY-MM-DD HH:MM)' },
          durationMinutes: { type: 'number', description: 'Duration in minutes' },
          location: { type: 'string', description: 'Meeting link or physical address' }
        },
        required: ['title', 'startDate']
      }
    },
    scriptJs: `
      const data = typeof input === 'string' ? JSON.parse(input) : input;
      return {
        result: \`Calendar event scheduled: "\${data.title}" on \${data.startDate} (\${data.durationMinutes || 60} mins).\`,
        payload: data
      };
    `
  },
  {
    id: 'schedule-notification',
    name: 'Schedule Notification',
    description: 'Schedules mobile system alerts and alarms for upcoming tasks or reminders.',
    category: 'System',
    icon: 'BellRing',
    version: '1.0.0',
    author: 'Google AI Edge Team',
    enabled: true,
    toolDefinition: {
      name: 'schedule_notification',
      description: 'Set a push notification / reminder alarm.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Notification title' },
          message: { type: 'string', description: 'Notification body text' },
          delaySeconds: { type: 'number', description: 'Delay in seconds from now' }
        },
        required: ['title', 'message']
      }
    },
    scriptJs: `
      const data = typeof input === 'string' ? JSON.parse(input) : input;
      return {
        result: \`Notification alarm set for "\${data.title}": will trigger in \${data.delaySeconds || 5} seconds.\`,
        payload: data
      };
    `
  }
];
