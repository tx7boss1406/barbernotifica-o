import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Scissors, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { label: "Início", href: "/#inicio" },
  { label: "Serviços", href: "/#servicos" },
  { label: "Barbeiros", href: "/#barbeiros" },
  { label: "Depoimentos", href: "/#depoimentos" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, loading } = useAuth();

  const scrollTo = (id: string) => {
    setOpen(false);
    if (location.pathname !== "/") {
      window.location.href = id;
      return;
    }
    const el = document.getElementById(id.replace("/#", ""));
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <Scissors className="h-6 w-6 text-gold" />
          <span className="font-heading text-xl font-bold tracking-wider text-foreground">
            BARBER CLUB <span className="text-gold">&</span> TATTOO
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((l) => (
            <button
              key={l.label}
              onClick={() => scrollTo(l.href)}
              className="font-body text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:text-gold"
            >
              {l.label}
            </button>
          ))}
          <Link
            to="/agendar"
            className="gold-gradient btn-premium rounded px-6 py-2.5 font-body text-sm font-semibold uppercase tracking-wider text-primary-foreground"
          >
            Agendar
          </Link>

          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5">
                    <User className="h-4 w-4 text-gold" />
                    <span className="font-body text-xs text-foreground">
                      {profile?.nome?.split(" ")[0] || "Conta"}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    title="Sair"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="rounded border border-border px-4 py-2 font-body text-xs text-muted-foreground transition-colors hover:border-gold hover:text-gold"
                >
                  Entrar / Criar Conta
                </Link>
              )}
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="text-foreground md:hidden">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <div className="flex flex-col gap-4 px-4 py-6">
              {navLinks.map((l) => (
                <button
                  key={l.label}
                  onClick={() => scrollTo(l.href)}
                  className="text-left font-body text-sm uppercase tracking-widest text-muted-foreground transition-colors hover:text-gold"
                >
                  {l.label}
                </button>
              ))}
              <Link
                to="/agendar"
                onClick={() => setOpen(false)}
                className="gold-gradient mt-2 rounded px-6 py-3 text-center font-body text-sm font-semibold uppercase tracking-wider text-primary-foreground"
              >
                Agendar
              </Link>

              {!loading && (
                <>
                  {user ? (
                    <div className="flex items-center justify-between border-t border-border pt-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gold" />
                        <span className="font-body text-sm text-foreground">
                          {profile?.nome?.split(" ")[0] || "Conta"}
                        </span>
                      </div>
                      <button
                        onClick={() => { handleLogout(); setOpen(false); }}
                        className="font-body text-xs text-destructive"
                      >
                        Sair
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/auth"
                      onClick={() => setOpen(false)}
                      className="mt-2 rounded border border-border px-6 py-3 text-center font-body text-sm text-muted-foreground transition-colors hover:border-gold"
                    >
                      Entrar / Criar Conta
                    </Link>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
