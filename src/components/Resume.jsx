import { forwardRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { profile, experience, education, selectedProjects, ongoingProjects, saasFreelanceProjects, englishProficiency, downloadLink } from '../data/resumeContent';
import ProjectEntry from './ProjectEntry';
import DynamicSkills from './DynamicSkills';
import DynamicCertifications from './DynamicCertifications';
import ContactForm from './ContactForm';
import { Mail, Phone, MapPin, Download, Moon, Sun } from 'lucide-react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import GithubActivity from './GithubActivity';


const Resume = forwardRef(({ darkMode, setDarkMode }, ref) => {
  const [expandedId, setExpandedId] = useState(null);
  const [showGithub, setShowGithub] = useState(false);
  const [localDarkMode, setLocalDarkMode] = useState(true);

  const isDarkMode = darkMode !== undefined ? darkMode : localDarkMode;
  const setIsDarkMode = setDarkMode !== undefined ? setDarkMode : setLocalDarkMode;

  // Initialize and toggle dark mode (only if not controlled by parent)
  useEffect(() => {
    if (darkMode !== undefined) return;
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode, darkMode]);

  const handleToggle = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const slideLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const slideUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div ref={ref} className="min-h-screen bg-slate-100 dark:bg-[#0b0f19] py-12 px-4 md:px-8 flex justify-center transition-colors duration-300">
      <div className="w-11/12 max-w-[1400px] bg-white dark:bg-[#111827] flex flex-col md:flex-row shadow-2xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative transition-colors duration-300">
        
        {/* Theme Toggle */}
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="absolute top-4 right-4 z-50 p-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-full hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors shadow-sm"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Left Sidebar */}
        <aside className="w-full md:w-[320px] bg-slate-900 dark:bg-[#060814] text-slate-300 p-8 md:p-10 shrink-0">
          
          <motion.div variants={slideLeft} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h3 className="text-white font-bold text-lg mb-4 uppercase tracking-wider border-b border-slate-700 pb-2">Personal Info</h3>
            <div className="space-y-4 text-sm font-medium mb-10">
              <div>
                <p className="text-slate-500 text-xs uppercase mb-1">Address</p>
                <p className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 text-purple-400 shrink-0" /> {profile.location}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase mb-1">Phone</p>
                <p className="flex items-start gap-2"><Phone size={16} className="mt-0.5 text-purple-400 shrink-0" /> {profile.phone}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase mb-1">Email</p>
                <p className="flex items-start gap-2 break-all"><Mail size={16} className="mt-0.5 text-purple-400 shrink-0" /> {profile.email}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase mb-1">Links</p>
                <div className="flex flex-col gap-2">
                  <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors"><FaLinkedin size={16} className="text-purple-400" /> LinkedIn</a>
                  <a href={profile.links.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors"><FaGithub size={16} className="text-purple-400" /> GitHub</a>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={slideLeft} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-10">
            <h3 className="text-white font-bold text-lg mb-4 uppercase tracking-wider border-b border-slate-700 pb-2">Skills</h3>
            <DynamicSkills />
          </motion.div>

          <motion.div variants={slideLeft} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-10">
            <h3 className="text-white font-bold text-lg mb-4 uppercase tracking-wider border-b border-slate-700 pb-2">Certifications</h3>
            <DynamicCertifications />
          </motion.div>

          <motion.div variants={slideLeft} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-10">
            <h3 className="text-white font-bold text-lg mb-4 uppercase tracking-wider border-b border-slate-700 pb-2">Languages</h3>
            <div className="text-sm">
              <p className="font-bold text-white mb-1">English</p>
              <p className="text-slate-400 text-xs border-l-2 border-purple-500/30 pl-2">{englishProficiency.test}</p>
            </div>
          </motion.div>

          <motion.div variants={slideLeft} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <a 
              href={downloadLink} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-all shadow-lg hover:shadow-purple-500/25"
            >
              <Download size={18} />
              Download Résumé
            </a>
          </motion.div>

        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 md:p-12 lg:p-16 text-slate-800 dark:text-slate-200">
          
          <motion.div variants={slideUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-10 border-b border-slate-200 dark:border-slate-800 pb-8">
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tighter uppercase font-serif mb-2">{profile.name.split(' ')[0]} <br/> {profile.name.split(' ')[1]}</h1>
            <h2 className="text-xl md:text-2xl text-purple-600 dark:text-purple-400 font-medium mb-6 font-mono">{profile.title}</h2>
            <p className="text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-400 text-justify">
              {profile.summary}
            </p>
          </motion.div>

          <motion.div variants={slideUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-12">
            <h3 className="text-xl font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b-2 border-purple-500 inline-block mb-6 pb-1">Experience</h3>
            {experience.map((job, idx) => (
              <div key={idx} className="mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
                  <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">{job.role}</h4>
                  <span className="text-sm font-mono text-purple-600 dark:text-purple-400 font-semibold">{job.dates}</span>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">{job.company}, {job.location}</p>
                <ul className="list-disc list-outside ml-4 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                  {job.bullets.map((bullet, i) => (
                    <li key={i} className="pl-1">{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>

          <motion.div variants={slideUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-12">
            <h3 className="text-xl font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b-2 border-purple-500 inline-block mb-6 pb-1">Selected Projects</h3>
            <div className="space-y-4">
              {[...selectedProjects, ...ongoingProjects, ...saasFreelanceProjects].map((project) => (
                <ProjectEntry 
                  key={project.id}
                  title={project.title}
                  stack={project.stack}
                  bullets={project.bullets}
                  links={project.links}
                  isExpanded={expandedId === project.id}
                  onToggle={() => handleToggle(project.id)}
                />
              ))}
            </div>
          </motion.div>

          <motion.div variants={slideUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h3 className="text-xl font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b-2 border-purple-500 inline-block mb-6 pb-1">Education</h3>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row justify-between sm:items-baseline mb-2">
                <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">{education.degree}</h4>
                <span className="text-sm font-mono text-purple-600 dark:text-purple-400 font-semibold">{education.expected}</span>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{education.institution}</p>
            </div>
          </motion.div>

          <motion.div variants={slideUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-16">
            <div className="flex items-center justify-between border-b-2 border-purple-500 mb-6 pb-2 pr-12">
              <h3 className="text-xl font-bold uppercase tracking-wider text-slate-900 dark:text-white inline-block m-0">Open Source Activity</h3>
              <button 
                onClick={() => setShowGithub(!showGithub)}
                className="text-sm bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-4 rounded-md transition-colors shadow-md"
              >
                {showGithub ? "Hide" : "View"} GitHub Activity
              </button>
            </div>
            {showGithub && <GithubActivity isDarkMode={isDarkMode} />}
          </motion.div>

          {/* Contact Section */}
          <motion.div variants={slideUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mt-16 mb-8">
            <h3 className="text-xl font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b-2 border-purple-500 inline-block mb-6 pb-1">Get In Touch</h3>
            <ContactForm />
          </motion.div>

        </main>
      </div>
    </div>
  );
});

Resume.displayName = "Resume";
export default Resume;
