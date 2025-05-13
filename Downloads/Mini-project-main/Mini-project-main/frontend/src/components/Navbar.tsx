import { Github, Notebook } from 'lucide-react'

const Navbar = () => {
  return (
    <div>
      <nav className="fixed w-full bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {/* Line Chart SVG icon */}
              <Notebook className="w-8 h-8 text-emerald-500" />
              <a href="/"><span className="ml-2 text-xl font-bold">Resonate</span></a>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="/" className="hover:text-emerald-500 transition-colors">Home</a>
              <a href="/about" className="hover:text-emerald-500 transition-colors">About Us</a>
              <a href="/chat" className="hover:text-emerald-500 transition-colors">Chat</a>
              <a href="https://github.com/ashlinalex1/" className="hover:text-emerald-500 transition-colors flex items-center">
                <Github className="w-5 h-5 mr-1" />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default Navbar
