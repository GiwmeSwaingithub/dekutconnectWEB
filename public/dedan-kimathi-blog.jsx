import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronRight, Calendar, User, Share2, X, Menu, Book, Lightbulb, Users, Award } from 'lucide-react';

// ============================================================
// CONTENT MANAGEMENT SYSTEM
// ============================================================
// To add new posts: Simply add objects to this array
// Each post needs: id, title, excerpt, content, author, date, category, image, video (optional)
// ============================================================

const BLOG_POSTS = [
  {
    id: 1,
    title: "DeKUT Launches Revolutionary AI Research Lab",
    excerpt: "The university unveils state-of-the-art artificial intelligence research facility, positioning Kenya as a leader in tech innovation across East Africa.",
    content: `Dedan Kimathi University of Technology has officially launched its cutting-edge Artificial Intelligence Research Lab, a milestone achievement that positions the institution at the forefront of technological innovation in East Africa.

The new facility, spanning over 2,000 square meters, houses advanced computing infrastructure including high-performance GPU clusters, quantum computing simulation systems, and collaborative research spaces designed to foster innovation.

"This lab represents our commitment to producing world-class researchers and solutions that address real-world challenges," said the Vice Chancellor during the inauguration ceremony attended by industry leaders and government officials.

The AI Lab will focus on four key research areas: machine learning applications in agriculture, healthcare diagnostics, climate modeling, and smart city solutions. Initial projects include developing AI-powered crop disease detection systems and automated medical imaging analysis tools.

Students and faculty will have access to cutting-edge resources, industry partnerships, and mentorship programs designed to accelerate innovation. The lab has already secured partnerships with leading tech companies and research institutions globally.`,
    author: "Dr. Sarah Njeri",
    date: "2026-03-28",
    category: "Research & Innovation",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=600&fit=crop",
    featured: true
  },
  {
    id: 2,
    title: "Engineering Students Win International Robotics Competition",
    excerpt: "Team DeKUT triumphs at the Pan-African Robotics Challenge, showcasing innovative solutions for agricultural automation and sustainable farming.",
    content: `A team of mechanical and electrical engineering students from Dedan Kimathi University has won first place at the prestigious Pan-African Robotics Challenge held in Lagos, Nigeria.

The winning project, dubbed "AgroBot Pro," is an autonomous agricultural robot designed to optimize planting, monitoring, and harvesting processes for smallholder farmers. The innovation addresses critical challenges in African agriculture through affordable, scalable technology.

The robot uses computer vision, IoT sensors, and machine learning algorithms to analyze soil conditions, detect plant diseases, and optimize water usage. It can operate in diverse terrain conditions and is powered by solar energy, making it ideal for rural applications.

"Our goal was to create technology that genuinely helps our communities," said team leader James Mwangi. "AgroBot Pro can increase crop yields by up to 40% while reducing water consumption by 30%."

The team competed against 45 universities from across the continent and impressed judges with their practical approach, technical excellence, and sustainable design. They received a $50,000 prize and mentorship opportunities with leading robotics companies.`,
    author: "Prof. Michael Kamau",
    date: "2026-03-25",
    category: "Student Success",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=600&fit=crop"
  },
  {
    id: 3,
    title: "Partnership with Silicon Valley Giants Announced",
    excerpt: "DeKUT signs landmark agreements with major tech corporations to establish innovation hub and provide internship opportunities for students.",
    content: `Dedan Kimathi University of Technology has announced strategic partnerships with several Silicon Valley technology companies, opening new doors for students and research collaboration.

The multi-year agreements include the establishment of an on-campus Innovation Hub, sponsored research projects, internship programs, and curriculum development support to ensure graduates are industry-ready.

Companies involved include major players in cloud computing, artificial intelligence, and cybersecurity sectors. The partnership will provide students with access to enterprise-grade tools, mentorship from industry experts, and direct pathways to employment opportunities.

"This collaboration bridges the gap between academia and industry," explained the Dean of Engineering. "Our students will gain hands-on experience with technologies shaping the future of work while contributing to real-world projects."

The Innovation Hub will feature co-working spaces, prototyping facilities, and regular workshops led by industry professionals. Selected students will participate in paid internships at partner companies' offices in Kenya and abroad.

Additionally, the partnership includes scholarship programs for outstanding students and research grants for faculty members working on cutting-edge projects in areas like blockchain, IoT, and renewable energy technologies.`,
    author: "Communications Office",
    date: "2026-03-22",
    category: "Partnerships",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=600&fit=crop",
    featured: true
  },
  {
    id: 4,
    title: "Groundbreaking Research on Solar Energy Storage Published",
    excerpt: "DeKUT researchers publish breakthrough findings in renewable energy journal, introducing novel battery technology with 3x higher capacity.",
    content: `Researchers at Dedan Kimathi University have published groundbreaking findings in the International Journal of Renewable Energy, presenting a novel approach to solar energy storage that could transform the renewable energy landscape.

The research team, led by Dr. Lucy Wambui, developed an innovative battery technology using locally-sourced materials that achieves three times the energy storage capacity of conventional lithium-ion batteries at a fraction of the cost.

"Our breakthrough lies in utilizing abundant natural materials found in Kenya," Dr. Wambui explained. "This makes the technology not only more efficient but also more sustainable and accessible for African communities."

The new battery design uses a unique combination of graphene-enhanced electrodes and bio-derived electrolytes, resulting in faster charging times, longer lifespan, and significantly reduced environmental impact compared to traditional batteries.

Field tests conducted in rural Kenyan communities demonstrated the technology's potential to provide reliable electricity to off-grid areas. A single household battery unit can store enough energy to power essential appliances for 72 hours without recharging.

The research has attracted international attention, with several renewable energy companies expressing interest in licensing the technology. The university is currently in discussions about pilot manufacturing programs that would create local jobs while advancing Kenya's renewable energy goals.`,
    author: "Dr. Lucy Wambui",
    date: "2026-03-20",
    category: "Research & Innovation",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&h=600&fit=crop"
  },
  {
    id: 5,
    title: "New Computer Science Curriculum Aligns with Industry 4.0",
    excerpt: "Updated program introduces cutting-edge courses in quantum computing, blockchain, and advanced AI to prepare students for future tech careers.",
    content: `Dedan Kimathi University has unveiled a completely redesigned Computer Science curriculum that integrates emerging technologies and industry best practices to prepare students for the rapidly evolving tech landscape.

The updated program, developed in consultation with leading tech companies and industry experts, introduces specialized tracks in quantum computing, blockchain development, advanced artificial intelligence, cybersecurity, and cloud architecture.

"We're not just teaching students to code; we're preparing them to be technology leaders," said Dr. Peter Gitau, Head of the Computer Science Department. "Our graduates will be equipped to solve complex challenges and drive innovation in the digital economy."

Key features of the new curriculum include:
- Hands-on projects with real industry partners
- Specialization options in emerging tech fields
- Integrated soft skills and entrepreneurship training
- Mandatory internships with leading tech companies
- Capstone projects addressing real-world problems

The program also emphasizes ethical AI development, data privacy, and sustainable technology practices. Students will participate in hackathons, innovation challenges, and collaborative research projects throughout their studies.

Industry partners have committed to providing guest lectures, mentorship, and guaranteed interview opportunities for graduates. The first cohort under the new curriculum will begin in September 2026, with early enrollment already exceeding expectations.`,
    author: "Dr. Peter Gitau",
    date: "2026-03-18",
    category: "Academics",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=600&fit=crop"
  },
  {
    id: 6,
    title: "DeKUT Hackathon Attracts Over 500 Participants",
    excerpt: "Annual innovation challenge sees record participation, with students developing solutions for healthcare, education, and climate change.",
    content: `The annual DeKUT Innovation Hackathon concluded with spectacular results, drawing over 500 participants from universities across Kenya and neighboring countries.

Held over an intensive 48-hour period, the hackathon challenged teams to develop technological solutions addressing pressing societal issues in healthcare, education, climate change, and financial inclusion.

The winning team created "MediConnect," a mobile platform that connects rural communities with healthcare providers through telemedicine, AI-powered symptom checking, and medication delivery coordination. The solution impressed judges with its practical approach and immediate impact potential.

"The creativity and technical skill displayed by participants was exceptional," noted one of the judges from a leading venture capital firm. "Several projects here have genuine commercial potential and social impact."

Other notable projects included:
- An AI tutoring system for personalized learning
- A blockchain-based supply chain tracker for agricultural products
- A climate monitoring network using low-cost IoT sensors
- A mobile banking solution for informal sector workers

Winners received cash prizes, incubation support, and mentorship opportunities. Several teams have already begun discussions with investors and accelerator programs to take their prototypes to market.

The event also featured workshops on product design, pitching to investors, and scaling startups, providing participants with valuable skills beyond coding.`,
    author: "Innovation Hub Team",
    date: "2026-03-15",
    category: "Events",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=600&fit=crop",
    featured: true
  },
  {
    id: 7,
    title: "Alumni Spotlight: From DeKUT to Global Tech Leadership",
    excerpt: "Graduate John Kariuki shares his journey from DeKUT student to Chief Technology Officer at a multinational tech company.",
    content: `John Kariuki's story exemplifies the transformative power of quality education and determination. A 2015 graduate of Dedan Kimathi University's Computer Engineering program, he now serves as Chief Technology Officer at a Fortune 500 technology company.

"DeKUT gave me more than technical skills," John reflects. "It taught me how to think critically, solve complex problems, and lead teams. The foundation I received there has been invaluable throughout my career."

After graduation, John joined a Nairobi-based startup as a junior developer. His innovative approach to solving technical challenges quickly earned him promotions, and within three years, he was leading the engineering team.

His big break came when he developed an innovative cloud architecture solution that caught the attention of international tech leaders. This led to opportunities in Silicon Valley, where he worked with cutting-edge technologies and managed increasingly large teams.

"I always remember my roots and the education that made it all possible," John says. He regularly returns to DeKUT as a guest lecturer, mentors current students, and has established a scholarship fund for students from underserved communities.

His advice to current students: "Focus on fundamentals, never stop learning, and don't be afraid to take on challenges that seem impossible. The skills and mindset you develop at DeKUT will open doors you can't even imagine yet."

John's success story is one of many from DeKUT alumni who are making significant impacts in technology, research, and entrepreneurship globally.`,
    author: "Alumni Relations",
    date: "2026-03-12",
    category: "Alumni",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1200&h=600&fit=crop"
  },
  {
    id: 8,
    title: "Green Campus Initiative Achieves Carbon Neutral Status",
    excerpt: "University's comprehensive sustainability program reduces emissions by 90%, setting new standards for environmental responsibility in higher education.",
    content: `Dedan Kimathi University has achieved a remarkable milestone by becoming carbon neutral, making it one of the first universities in East Africa to reach this environmental landmark.

The achievement is the culmination of a five-year comprehensive sustainability program that included installing solar panels across campus, implementing advanced waste management systems, establishing green transportation options, and creating extensive tree-planting initiatives.

"Sustainability is not just an operational goal; it's core to our mission as a technology university," explained the Director of Sustainability. "We're demonstrating that environmental responsibility and academic excellence go hand in hand."

Key achievements include:
- 75% of campus energy from renewable sources
- Zero-waste cafeteria and recycling programs achieving 85% waste diversion
- 10,000 trees planted on and around campus
- Electric shuttle buses replacing diesel vehicles
- Rainwater harvesting systems reducing water consumption by 40%

The program has also become an educational tool, with students conducting research on sustainable technologies, participating in environmental conservation projects, and developing innovative solutions for climate challenges.

The carbon offsets for remaining emissions are achieved through partnerships with local reforestation projects and renewable energy initiatives in surrounding communities, creating positive environmental and social impact beyond the campus.

The success has attracted attention from other institutions seeking to replicate the model, positioning DeKUT as a leader in sustainable campus operations.`,
    author: "Sustainability Office",
    date: "2026-03-10",
    category: "Campus Life",
    image: "https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=1200&h=600&fit=crop"
  },
  {
    id: 9,
    title: "International Student Exchange Program Expands to 20 Countries",
    excerpt: "New partnerships enable DeKUT students to study abroad while hosting international scholars, enriching campus diversity and global perspectives.",
    content: `Dedan Kimathi University's International Exchange Program has expanded dramatically, now offering students opportunities to study at partner universities in 20 countries across five continents.

The expanded program includes partnerships with prestigious institutions in the United States, United Kingdom, Germany, China, Japan, Australia, and several African nations, providing diverse options for academic and cultural experiences.

"Global exposure is essential for our students," said the Director of International Relations. "These exchanges develop cross-cultural competencies, broaden perspectives, and create professional networks that last a lifetime."

The program offers various options:
- Semester-long exchange programs
- Short-term research collaborations
- Summer schools and specialized workshops
- Joint degree programs with select partners
- Virtual exchange opportunities for inclusive access

This year, over 150 DeKUT students will study abroad, while the university hosts approximately 100 international students from partner institutions, creating a vibrant multicultural campus environment.

Participating students report transformative experiences, gaining new perspectives on their fields, building international friendships, and developing independence and adaptability that enhance their career prospects.

The university provides comprehensive support including application assistance, scholarship opportunities for qualified students, pre-departure orientation, and ongoing support during exchanges.

Success stories include students who secured international internships, published joint research with foreign collaborators, and established startups with peers met during exchanges.`,
    author: "International Relations Office",
    date: "2026-03-08",
    category: "Global Engagement",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=600&fit=crop"
  },
  {
    id: 10,
    title: "Women in STEM Initiative Doubles Female Enrollment",
    excerpt: "Targeted outreach and support programs successfully increase women's participation in technology and engineering fields at DeKUT.",
    content: `Dedan Kimathi University's Women in STEM initiative has achieved remarkable success, doubling female enrollment in technology and engineering programs over the past three years.

The comprehensive program addresses barriers that historically limited women's participation in STEM fields through targeted interventions at multiple levels, from high school outreach to professional development.

"We're not just recruiting more women; we're creating an environment where they can thrive," explained Dr. Grace Muthoni, who leads the initiative. "This requires changing culture, providing support, and showcasing role models."

Program components include:
- Outreach to high schools to inspire girls to pursue STEM
- Mentorship pairing female students with successful professionals
- Scholarship opportunities for outstanding female applicants
- Women in Tech clubs and networking events
- Leadership development workshops
- Safe reporting mechanisms for any discrimination

The results speak for themselves. Female students now comprise 35% of engineering enrollments, up from 17% three years ago. Academic performance metrics show female students matching or exceeding their male counterparts across most programs.

"The support network here is incredible," says Alice Wanjiru, a third-year Computer Science student. "I never feel alone or out of place. We're encouraged to be bold, ask questions, and take leadership roles."

The initiative has also increased faculty diversity, with successful recruitment of accomplished female professors and researchers who serve as inspiring role models.

Beyond campus, the program partners with tech companies committed to diversity, creating internship and employment pipelines for female graduates. Several alumni have gone on to found successful tech startups or assume leadership positions in major corporations.`,
    author: "Dr. Grace Muthoni",
    date: "2026-03-05",
    category: "Diversity & Inclusion",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=600&fit=crop"
  },
  {
    id: 11,
    title: "New Maker Space Opens for Student Innovation",
    excerpt: "State-of-the-art facility equipped with 3D printers, laser cutters, and electronics labs enables students to bring their ideas to life.",
    content: `Dedan Kimathi University has inaugurated an impressive new Maker Space, a 3,000-square-foot facility designed to transform student ideas into tangible prototypes and products.

The space features cutting-edge equipment including multiple 3D printers, laser cutters, CNC machines, electronics workbenches, woodworking tools, and a dedicated area for textile and wearable technology projects.

"This is where imagination meets reality," said the Maker Space coordinator during the opening ceremony. "Students can experiment, fail, learn, and create without the constraints they might face elsewhere."

The facility operates on an open-access model, with trained staff available to provide guidance and safety instruction. Students can reserve time slots for individual projects or work on team initiatives.

Already, the space has facilitated impressive projects:
- Custom prosthetic limbs designed for local hospitals
- Affordable water filtration devices for rural communities
- Prototype agricultural drones for precision farming
- Wearable health monitoring devices

Beyond equipment access, the Maker Space hosts regular workshops on design thinking, rapid prototyping, and manufacturing processes. Industry experts and successful entrepreneurs conduct sessions sharing real-world insights.

The space also serves as an incubation environment for student startups, with several projects transitioning from prototypes to market-ready products. Connections with local manufacturers help students scale production when ready.

"It's not just about making things," explains a mechanical engineering student working on a solar-powered irrigation controller. "It's about learning to iterate, problem-solve, and think like an engineer."`,
    author: "Engineering Faculty",
    date: "2026-03-02",
    category: "Facilities",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&h=600&fit=crop"
  },
  {
    id: 12,
    title: "DeKUT Cybersecurity Team Places Top 10 Globally",
    excerpt: "Student team demonstrates exceptional skills in international competition, solving complex security challenges and defending against simulated attacks.",
    content: `The DeKUT Cybersecurity Team has achieved an outstanding top-10 finish in the Global Cyber Defense Challenge, competing against elite teams from universities worldwide.

The competition, which attracts over 300 teams from more than 50 countries, tests participants' abilities to defend networks, identify vulnerabilities, respond to incidents, and conduct forensic analysis under time pressure.

"Our students demonstrated world-class technical skills and strategic thinking," said their faculty advisor. "They faced the same challenges as teams from MIT, Stanford, and Oxford, and held their own impressively."

The team spent months preparing, studying advanced security concepts, practicing on simulated networks, and learning from past competitions. Their dedication paid off as they successfully defended against sophisticated simulated attacks and identified critical vulnerabilities others missed.

Team captain Diana Koech reflected on the experience: "This competition pushed us beyond what we thought possible. We learned not just technical skills but how to work under extreme pressure, communicate effectively, and think like both attackers and defenders."

The success has opened doors for team members, with several receiving job offers from leading cybersecurity firms and opportunities to present at international security conferences.

The university is expanding its cybersecurity program in response to growing demand, introducing new courses in ethical hacking, digital forensics, and security architecture. Partnerships with industry leaders provide students with access to enterprise-grade security tools and real-world scenarios.`,
    author: "Computer Science Department",
    date: "2026-02-28",
    category: "Student Success",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=600&fit=crop"
  }
];

// Categories for filtering
const CATEGORIES = [
  "All Posts",
  "Research & Innovation",
  "Student Success",
  "Partnerships",
  "Academics",
  "Events",
  "Alumni",
  "Campus Life",
  "Global Engagement",
  "Diversity & Inclusion",
  "Facilities"
];

// SEO Meta Component
const SEOHead = ({ title, description, image }) => {
  useEffect(() => {
    document.title = title || "DeKUT Blog - Dedan Kimathi University of Technology";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description || "Official blog of Dedan Kimathi University of Technology - Latest news, research, student achievements, and innovation in technology and engineering education.");
    }
    
    // Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title || "DeKUT Blog");
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', description || "Official blog of Dedan Kimathi University of Technology");
    
    if (image) {
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) ogImage.setAttribute('content', image);
    }
  }, [title, description, image]);
  
  return null;
};

// Main Blog Component
export default function DeKUTBlog() {
  const [selectedCategory, setSelectedCategory] = useState("All Posts");
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedPosts, setDisplayedPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);

  // Filter posts based on category and search
  const filteredPosts = BLOG_POSTS.filter(post => {
    const matchesCategory = selectedCategory === "All Posts" || post.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Initialize with first batch of posts
  useEffect(() => {
    setDisplayedPosts(filteredPosts.slice(0, 6));
    setHasMore(filteredPosts.length > 6);
  }, [selectedCategory, searchQuery]);

  // Infinite scroll implementation
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          const currentLength = displayedPosts.length;
          const nextBatch = filteredPosts.slice(currentLength, currentLength + 3);
          
          if (nextBatch.length > 0) {
            setDisplayedPosts(prev => [...prev, ...nextBatch]);
          }
          
          if (currentLength + nextBatch.length >= filteredPosts.length) {
            setHasMore(false);
          }
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [displayedPosts, filteredPosts, hasMore]);

  const featuredPosts = BLOG_POSTS.filter(post => post.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <SEOHead />
      
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white sticky top-0 z-40 shadow-2xl border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <Book className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">DeKUT</h1>
                <p className="text-xs text-orange-300">Innovation Hub</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="hover:text-orange-300 transition-colors flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Research
              </a>
              <a href="#" className="hover:text-orange-300 transition-colors flex items-center gap-2">
                <Users className="w-4 h-4" />
                Students
              </a>
              <a href="#" className="hover:text-orange-300 transition-colors flex items-center gap-2">
                <Award className="w-4 h-4" />
                About
              </a>
              <button className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all font-semibold">
                Apply Now
              </button>
            </div>
            
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-800 border-t border-slate-700">
            <div className="px-4 py-4 space-y-3">
              <a href="#" className="block hover:text-orange-300 transition-colors py-2">Research</a>
              <a href="#" className="block hover:text-orange-300 transition-colors py-2">Students</a>
              <a href="#" className="block hover:text-orange-300 transition-colors py-2">About</a>
              <button className="w-full bg-gradient-to-r from-orange-500 to-red-600 px-6 py-2 rounded-full font-semibold">
                Apply Now
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-orange-900/30"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(251, 146, 60, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)'
        }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-slate-800 via-orange-700 to-red-700 bg-clip-text text-transparent leading-tight">
              Innovation. Research. Excellence.
            </h2>
            <p className="text-xl md:text-2xl text-slate-700 mb-8 font-light leading-relaxed">
              Discover groundbreaking research, student achievements, and the future of technology at Kenya's premier university of technology
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Search stories, research, innovations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-6 py-5 rounded-2xl bg-white shadow-2xl border-2 border-transparent focus:border-orange-500 focus:outline-none text-lg transition-all"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Featured Posts */}
      {!searchQuery && selectedCategory === "All Posts" && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 mb-20 relative z-10">
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-slate-800 mb-2">Featured Stories</h3>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {featuredPosts.map(post => (
              <article 
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="group bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer"
              >
                <div className="relative overflow-hidden h-56">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                      Featured
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="text-slate-600 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center text-orange-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                    Read More <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all transform hover:scale-105 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 hover:bg-slate-100 shadow'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-slate-800 mb-2">
            {searchQuery ? `Search Results for "${searchQuery}"` : selectedCategory}
          </h3>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-full"></div>
        </div>

        {displayedPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-slate-500">No posts found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedPosts.map((post, index) => (
                <article 
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  style={{
                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div className="relative overflow-hidden h-48">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="bg-white/90 backdrop-blur-sm text-slate-800 px-3 py-1 rounded-full text-xs font-semibold">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {post.author}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                    <p className="text-slate-600 line-clamp-3 text-sm leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="mt-4 flex items-center text-orange-600 font-semibold text-sm group-hover:gap-2 gap-1 transition-all">
                      Read More <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Infinite Scroll Trigger */}
            {hasMore && (
              <div ref={observerTarget} className="flex justify-center mt-12">
                <div className="animate-pulse flex items-center gap-3 text-slate-500">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
              </div>
            )}

            {!hasMore && displayedPosts.length > 0 && (
              <div className="text-center mt-12 py-8 border-t-2 border-slate-200">
                <p className="text-slate-500 text-lg">You've reached the end of the posts</p>
              </div>
            )}
          </>
        )}
      </section>

      {/* Post Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full my-8 shadow-2xl transform transition-all">
            <div className="relative">
              <img 
                src={selectedPost.image} 
                alt={selectedPost.title}
                className="w-full h-96 object-cover rounded-t-3xl"
              />
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-all shadow-lg"
              >
                <X className="w-6 h-6 text-slate-800" />
              </button>
              <div className="absolute bottom-6 left-6">
                <span className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  {selectedPost.category}
                </span>
              </div>
            </div>
            
            <div className="p-8 md:p-12">
              <div className="flex items-center gap-6 text-sm text-slate-500 mb-6">
                <span className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {new Date(selectedPost.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {selectedPost.author}
                </span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-6 leading-tight">
                {selectedPost.title}
              </h2>
              
              <p className="text-xl text-slate-600 mb-8 leading-relaxed font-light italic">
                {selectedPost.excerpt}
              </p>
              
              <div className="prose prose-lg max-w-none">
                {selectedPost.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-slate-700 mb-6 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
              
              <div className="mt-12 pt-8 border-t-2 border-slate-200">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: selectedPost.title,
                          text: selectedPost.excerpt,
                          url: window.location.href
                        });
                      }
                    }}
                    className="flex items-center gap-2 text-slate-600 hover:text-orange-600 transition-colors font-semibold"
                  >
                    <Share2 className="w-5 h-5" />
                    Share this story
                  </button>
                  
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-full hover:shadow-lg transform hover:scale-105 transition-all font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-16 border-t-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Book className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">DeKUT</h3>
                  <p className="text-xs text-orange-300">Innovation Hub</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Dedan Kimathi University of Technology - Inspiring Innovation, Transforming Lives
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-orange-300 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-orange-300 transition-colors">Academics</a></li>
                <li><a href="#" className="hover:text-orange-300 transition-colors">Admissions</a></li>
                <li><a href="#" className="hover:text-orange-300 transition-colors">Research</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4">Resources</h4>
              <ul className="space-y-2 text-slate-300">
                <li><a href="#" className="hover:text-orange-300 transition-colors">Library</a></li>
                <li><a href="#" className="hover:text-orange-300 transition-colors">Student Portal</a></li>
                <li><a href="#" className="hover:text-orange-300 transition-colors">Career Services</a></li>
                <li><a href="#" className="hover:text-orange-300 transition-colors">Alumni Network</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4">Contact</h4>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>Private Bag, Dedan Kimathi</li>
                <li>Nyeri, Kenya</li>
                <li>+254 123 456 789</li>
                <li>info@dkut.ac.ke</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-700 text-center text-slate-400 text-sm">
            <p>&copy; 2026 Dedan Kimathi University of Technology. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
