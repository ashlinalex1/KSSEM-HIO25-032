import { Github, Notebook, Linkedin, Mail, Twitter } from "lucide-react"

const Footer = () => {
  return (
    <div>
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-8 md:mb-0">
              <Notebook className="w-8 h-8 text-emerald-500" />
              <span className="ml-2 text-xl font-bold">Resonate</span>
            </div>
            <div className="flex space-x-6">
              <a href="https://www.instagram.com/ashlin._.alex/" className="text-gray-400 hover:text-emerald-500">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="https://www.linkedin.com/in/ashlin-alex-6543a629b/" className="text-gray-400 hover:text-emerald-500">
                <Linkedin className="w-6 h-6" />
              </a>
              <a href="mailto:ashlinalex12@gmail.com" className="text-gray-400 hover:text-emerald-500">
                <Mail className="w-6 h-6" />
              </a>
              <a href="https://github.com/ashlinalex1/" className="text-gray-400 hover:text-emerald-500">
                <Github className="w-6 h-6" />
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400 text-sm">
            © 2025 Resonate. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Footer
