/**
 * AI Image Generation Prompts for Hub Spaces
 *
 * Detailed prompts for each hub area to generate compelling visualizations
 * Can be used with: Midjourney, DALL-E, Stable Diffusion, or any AI image generator
 *
 * Last Updated: 2026-02-13
 */

export interface ImagePrompt {
  space_name: string;
  prompt: string;
  negative_prompt?: string;
  style_keywords: string[];
  aspect_ratio: '16:9' | '4:3' | '1:1' | '9:16';
  suggested_tools: string[];
}

export const HUB_IMAGE_PROMPTS: ImagePrompt[] = [
  {
    space_name: 'Refurbishment Workshop',
    prompt: `Professional electronics refurbishment workshop in Zürich, Switzerland. Clean, well-lit industrial space with 6-8 organized repair workstations. Modern LED lighting from 2.4-3.6m high ceilings. Technicians working on laptops and computers at ergonomic workbenches with ESD-safe mats. Organized pegboard walls with tools, shelves with spare parts in clear bins. Separate zones visible: repair area with soldering stations, data wipe stations with multiple computers, quality assurance testing area. Clean concrete floors, bright natural light from large windows. Professional yet approachable atmosphere. Realistic, architectural photography style.`,
    negative_prompt: 'cluttered, messy, dark, cramped, warehouse, factory, dirty, chaotic',
    style_keywords: ['industrial design', 'workshop architecture', 'professional workspace', 'electronics repair', 'modern industrial'],
    aspect_ratio: '16:9',
    suggested_tools: ['Midjourney', 'DALL-E 3', 'Stable Diffusion XL'],
  },
  {
    space_name: 'Makerspace & Hackerspace',
    prompt: `Modern makerspace and hackerspace with 3D printers, laser cutters, and electronics workbenches. Open, collaborative layout with 12 workstations. Bright, creative atmosphere with colorful LED strip lighting. 3D printers actively printing, laser cutter visible, modular soldering stations with fume extraction. Tool library wall with organized equipment. Young makers and hobbyists working on projects. Mix of wood, metal, and acrylic work surfaces. Inspirational tech posters on walls. Large windows, concrete and exposed brick aesthetic. Creative, energetic vibe. High-quality architectural photography.`,
    negative_prompt: 'cluttered, unsafe, dark, boring, corporate office, traditional workshop',
    style_keywords: ['makerspace design', 'creative workspace', 'fab lab', 'hackerspace aesthetic', 'modern industrial'],
    aspect_ratio: '16:9',
    suggested_tools: ['Midjourney', 'DALL-E 3', 'Stable Diffusion XL'],
  },
  {
    space_name: 'AI Lab & Server Room',
    prompt: `Professional AI lab and server room with GPU computing racks. Clean, climate-controlled environment with raised floors. 2-4 server racks with NVIDIA GPUs visible through glass panels, LED indicators glowing blue and green. Organized cable management, proper cooling systems. Monitoring screens showing AI training metrics. Modern, minimalist design with white walls and professional lighting. Small workstation area for data scientists. High-tech, futuristic but realistic aesthetic. Professional data center photography style.`,
    negative_prompt: 'messy cables, cluttered, outdated equipment, dark, sci-fi unrealistic, consumer hardware',
    style_keywords: ['data center design', 'server room architecture', 'AI computing', 'professional IT infrastructure'],
    aspect_ratio: '4:3',
    suggested_tools: ['Midjourney', 'DALL-E 3', 'Stable Diffusion XL'],
  },
  {
    space_name: 'Event Space & Community Café',
    prompt: `Multi-purpose event space and community café in modern industrial building. Flexible seating for 50-80 people with movable chairs and tables. Café area with fair-trade coffee bar, comfortable seating, and warm lighting during daytime. Stage area with sound system and projection screen for evening events. High ceilings (3-3.6m) with exposed ventilation, wooden accents, plants, large windows. Welcoming, community-focused atmosphere. People having coffee and conversations. Warm, inviting color palette with natural materials. Architectural photography style, golden hour lighting.`,
    negative_prompt: 'corporate, sterile, cold, traditional café, fancy restaurant, dark, cramped',
    style_keywords: ['community space design', 'multi-purpose venue', 'modern café', 'event space architecture', 'third place'],
    aspect_ratio: '16:9',
    suggested_tools: ['Midjourney', 'DALL-E 3', 'Stable Diffusion XL'],
  },
  {
    space_name: 'Training & Course Room',
    prompt: `Modern training and education room with 20 workstations. Each station has a refurbished laptop and monitor on clean desks. U-shape or classroom layout facing a large projection screen and whiteboard. Instructor area at front with presentation equipment. Good lighting, acoustic panels, plants for air quality. Mix of ages and backgrounds - adults learning digital skills. Welcoming, educational atmosphere. Clean, organized, professional yet approachable. Natural light from windows. Contemporary educational space design.`,
    negative_prompt: 'traditional classroom, boring, cramped, outdated computers, corporate training room, dark',
    style_keywords: ['modern classroom', 'adult education space', 'digital literacy center', 'training room design'],
    aspect_ratio: '16:9',
    suggested_tools: ['Midjourney', 'DALL-E 3', 'Stable Diffusion XL'],
  },
  {
    space_name: 'Computer History Museum',
    prompt: `Curated computer history museum exhibition space. Glass display cases with vintage computers: Commodore 64, Amiga 500, NeXT Computer, early Macintosh, vintage synthesizers, old gaming consoles. Warm museum lighting highlighting the exhibits. Clean, minimalist white walls with informative labels. Some computers set up as interactive stations where visitors can try them. Tech enthusiasts and families exploring. 40m² permanent exhibition with 20m² rotating exhibits. Professional museum design aesthetic. Nostalgic yet educational atmosphere.`,
    negative_prompt: 'cluttered, dusty, warehouse, storage room, dark, messy, junkyard',
    style_keywords: ['museum design', 'technology exhibition', 'retro computing', 'interactive museum', 'educational space'],
    aspect_ratio: '16:9',
    suggested_tools: ['Midjourney', 'DALL-E 3', 'Stable Diffusion XL'],
  },
  {
    space_name: 'Synth Lab & Music Studio',
    prompt: `Electronic music studio and vintage synthesizer laboratory. Vintage Roland, Korg, and Moog synthesizers from 1970s-80s on workbenches. 6 restoration workstations with oscilloscopes and soldering equipment. Modular synthesis setup for workshops. Small performance area (20m²) with sound system and atmospheric lighting for 20-30 person concerts. Circuit-bent instruments on display. Creative, artistic vibe with warm lighting. Music equipment properly organized. Studio monitors and cables neatly arranged. Experimental music space aesthetic.`,
    negative_prompt: 'messy cables, cluttered, traditional recording studio, corporate, boring, dark basement',
    style_keywords: ['music studio design', 'synthesizer workshop', 'electronic music space', 'vintage audio equipment'],
    aspect_ratio: '16:9',
    suggested_tools: ['Midjourney', 'DALL-E 3', 'Stable Diffusion XL'],
  },
  {
    space_name: 'E-Waste Art Studio',
    prompt: `Creative art studio for electronic waste transformation. 3 artist workstations (10-12m² each) with tables, tools, and in-progress sculptures made from circuit boards, computer parts, and cables. Finished e-waste art pieces displayed: sculptures made from motherboards, wall art from hard drive platters, installations using old monitors. Natural light, white walls, creative chaos organized. Artists working with saws, glue, soldering irons to create art from discarded electronics. Inspiring, creative atmosphere. Art gallery meets workshop aesthetic.`,
    negative_prompt: 'junkyard, messy, dirty, dark, unsafe, chaotic, warehouse',
    style_keywords: ['art studio design', 'upcycled art', 'electronic waste art', 'creative workspace', 'gallery space'],
    aspect_ratio: '4:3',
    suggested_tools: ['Midjourney', 'DALL-E 3', 'Stable Diffusion XL'],
  },
  {
    space_name: 'Shop & Customer Area',
    prompt: `Clean, welcoming electronics shop and customer service area. 50m² sales floor with 20-30 refurbished laptops and computers displayed on shelves and tables. Professional retail lighting. Customers browsing and testing devices at demo stations. Friendly staff at checkout counter. Organized, Apple Store-inspired aesthetic but more approachable and sustainable. Clear price labels, product information. Intake area visible where customers bring devices for repair. Bright, transparent, trustworthy atmosphere. Modern retail design with sustainability focus.`,
    negative_prompt: 'cluttered pawn shop, messy, dark, warehouse, traditional computer store, corporate',
    style_keywords: ['retail design', 'electronics store', 'sustainable retail', 'customer service area', 'modern shop'],
    aspect_ratio: '16:9',
    suggested_tools: ['Midjourney', 'DALL-E 3', 'Stable Diffusion XL'],
  },
  {
    space_name: 'Hub Exterior & Building',
    prompt: `Modern industrial building in Zürich agglomeration (Volketswil/Schlieren area) housing the Revamp-IT Hub. 500-600m² ground floor space with large windows showing activity inside. Clean, renovated industrial architecture with sustainable design elements. Bike parking, accessible entrance, clear signage. Mix of concrete, glass, and metal. Green elements - plants, sustainable materials. Welcoming entrance with the Revamp-IT logo. Public transport accessible location. Professional architectural photography, daytime, slight overcast Swiss weather. Realistic, contemporary Swiss industrial architecture.`,
    negative_prompt: 'run-down, abandoned, warehouse, ugly, corporate tower, traditional office building',
    style_keywords: ['industrial architecture', 'Swiss design', 'sustainable building', 'modern renovation', 'community space exterior'],
    aspect_ratio: '16:9',
    suggested_tools: ['Midjourney', 'DALL-E 3', 'Stable Diffusion XL'],
  },
  {
    space_name: 'Repair Café Event',
    prompt: `Lively Repair Café event in progress. Community members bringing broken devices (laptops, phones, small appliances) to volunteer technicians. 6 repair workstations set up with tools. Mix of ages: elderly person learning to fix their device, students volunteering, families participating. Collaborative, educational atmosphere. Hand-written signs, coffee and snacks available. Warm, community vibe. People talking, learning, fixing things together. Natural light, welcoming space. Documentary photography style capturing genuine community interaction.`,
    negative_prompt: 'corporate, formal, staged, professional repair shop, cold, sterile',
    style_keywords: ['community event', 'repair café', 'social enterprise', 'collaborative learning', 'documentary photography'],
    aspect_ratio: '16:9',
    suggested_tools: ['Midjourney', 'DALL-E 3', 'Stable Diffusion XL'],
  },
  {
    space_name: 'Robotics Lab',
    prompt: `Educational robotics laboratory with Arduino and Raspberry Pi projects. 10 workstations with electronics, sensors, motors, and microcontrollers. Students and hobbyists building autonomous robots. Test area (20m²) with autonomous robot navigation course. Shelves with robotics kits ready for school workshops. Multiple robot chassis in various stages of completion. Educational posters about sensors and programming. Bright, engaging, STEM education atmosphere. Modern educational lab design with hands-on learning focus.`,
    negative_prompt: 'industrial robots, factory, dark, boring classroom, outdated, messy',
    style_keywords: ['robotics education', 'STEM lab', 'maker education', 'hands-on learning', 'technology education'],
    aspect_ratio: '16:9',
    suggested_tools: ['Midjourney', 'DALL-E 3', 'Stable Diffusion XL'],
  },
];

/**
 * Generate a complete prompt string for a specific space
 */
export function getFullPrompt(spaceName: string): string {
  const config = HUB_IMAGE_PROMPTS.find(p => p.space_name === spaceName);
  if (!config) return '';

  let fullPrompt = config.prompt;

  // Add style keywords
  if (config.style_keywords.length > 0) {
    fullPrompt += ` Style: ${config.style_keywords.join(', ')}.`;
  }

  // Add quality enhancers
  fullPrompt += ' High quality, professional photography, realistic, detailed, well-lit, architectural digest style.';

  return fullPrompt;
}

/**
 * Get Midjourney-specific formatted prompt
 */
export function getMidjourneyPrompt(spaceName: string): string {
  const config = HUB_IMAGE_PROMPTS.find(p => p.space_name === spaceName);
  if (!config) return '';

  let prompt = getFullPrompt(spaceName);

  // Add Midjourney parameters
  prompt += ` --ar ${config.aspect_ratio}`;
  prompt += ' --style raw --v 6';

  if (config.negative_prompt) {
    prompt += ` --no ${config.negative_prompt}`;
  }

  return prompt;
}

/**
 * Get DALL-E 3 formatted prompt (max 4000 chars)
 */
export function getDallEPrompt(spaceName: string): string {
  const config = HUB_IMAGE_PROMPTS.find(p => p.space_name === spaceName);
  if (!config) return '';

  let prompt = getFullPrompt(spaceName);

  // DALL-E 3 doesn't support negative prompts, so incorporate them as positive instructions
  if (config.negative_prompt) {
    const negatives = config.negative_prompt.split(', ');
    prompt += ` Avoid: ${negatives.join(', ')}.`;
  }

  // Trim to 4000 chars if needed
  return prompt.slice(0, 4000);
}
