import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const features = [
  { icon:'📍', title:'GPS Location', desc:'Auto-capture your exact location when reporting issues' },
  { icon:'🔁', title:'Live Tracking', desc:'Track complaint status from submission to resolution' },
  { icon:'🗺️', title:'City Map',     desc:'View all civic issues plotted on an interactive map' },
  { icon:'📊', title:'Analytics',    desc:'Transparent dashboards for authorities and citizens' },
  { icon:'🔔', title:'Notifications',desc:'Get email and app alerts at every status change' },
  { icon:'⭐', title:'Rate & Review', desc:'Rate resolutions to drive quality service delivery' },
];

export default function Landing() {
  return (
    <div className="min-h-screen" style={{background:'linear-gradient(160deg,#0F172A 0%,#1E3A8A 50%,#0F172A 100%)'}}>

      {/* Navbar */}
      <nav className="flex items-center justify-between px-5 sm:px-10 py-4 sm:py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-lg"
            style={{background:'linear-gradient(135deg,#3B82F6,#1D4ED8)'}}>C</div>
          <span className="text-white font-bold text-base sm:text-lg">CivicConnect</span>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Link to="/login" className="text-white/80 hover:text-white px-3 sm:px-4 py-2 text-sm font-medium transition-colors">
            Login
          </Link>
          <Link to="/register"
            className="text-white px-4 sm:px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{background:'linear-gradient(135deg,#3B82F6,#1D4ED8)'}}>
            Register
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24 text-center">
        <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.65}}>
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-5 border"
            style={{background:'rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.75)',borderColor:'rgba(255,255,255,0.15)'}}>
            🏛️ Smart Civic Issue Management
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight mb-5">
            Report. Track.<br />
            <span style={{color:'#60A5FA'}}>Resolve.</span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Connect citizens with authorities to fix civic problems — faster, transparently, and accountably.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register"
              className="text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all hover:opacity-90 active:scale-95"
              style={{background:'linear-gradient(135deg,#3B82F6,#1D4ED8)',boxShadow:'0 4px 20px rgba(59,130,246,0.4)'}}>
              🚀 Report an Issue
            </Link>
            <Link to="/login"
              className="text-white px-8 py-3.5 rounded-xl font-bold text-base border transition-all hover:bg-white/10"
              style={{borderColor:'rgba(255,255,255,0.2)'}}>
              Sign In →
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}}
          className="grid grid-cols-3 gap-4 sm:gap-8 mt-14 sm:mt-20 max-w-sm sm:max-w-md mx-auto">
          {[['10K+','Issues Resolved'],['50+','Departments'],['98%','Satisfaction']].map(([v,l]) => (
            <div key={l} className="text-center">
              <p className="text-2xl sm:text-3xl font-black text-white">{v}</p>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5">{l}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Features */}
      <div className="py-14 sm:py-20 px-5 sm:px-8" style={{background:'rgba(255,255,255,0.04)',borderTop:'1px solid rgba(255,255,255,0.07)'}}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-10">Everything you need</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.05*i}}
                className="rounded-2xl p-5 border transition-colors"
                style={{background:'rgba(255,255,255,0.05)',borderColor:'rgba(255,255,255,0.08)'}}>
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-white font-bold mb-1.5 text-sm">{f.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 sm:py-20 text-center px-5">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Ready to improve your city?</h2>
        <p className="text-slate-400 mb-7 text-sm sm:text-base">Join thousands of citizens making a difference.</p>
        <Link to="/register"
          className="inline-block text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl font-bold text-base transition-all hover:opacity-90 active:scale-95"
          style={{background:'linear-gradient(135deg,#3B82F6,#1D4ED8)',boxShadow:'0 4px 20px rgba(59,130,246,0.35)'}}>
          Get Started Free →
        </Link>
      </div>

      <footer className="py-7 text-center text-slate-500 text-xs sm:text-sm border-t" style={{borderColor:'rgba(255,255,255,0.07)'}}>
        © {new Date().getFullYear()} CivicConnect — Smart Civic Issue Management
      </footer>
    </div>
  );
}
