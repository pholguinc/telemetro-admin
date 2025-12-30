import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, ChevronDown, ChevronRight, Menu, ChevronLeft } from "lucide-react";
import {
  LayoutDashboard,
  Image,
  Users,
  Package,
  Briefcase,
  Video,
  Music,
  Vote,
  Gift,
  Megaphone,
  PlayCircle,
  Activity,
  BookOpen,
  Bell,
  Ticket,
  Star,
  Shield,
  BarChart3,
  Heart,
  Radio,
  TrendingUp,
  CreditCard,
  Brain,
  TestTube,
} from "lucide-react";

interface MenuItem {
  title: string;
  path: string;
  icon: any;
  color: string;
}

interface MenuGroup {
  title: string;
  icon: any;
  color: string;
  items: MenuItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuGroups: (MenuItem | MenuGroup)[] = [
    {
      title: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
      color: "text-blue-600",
    },
    {
      title: "Contenido",
      icon: Image,
      color: "text-orange-600",
      items: [
        {
          title: "Gestión de Banners",
          path: "/banners",
          icon: Image,
          color: "text-orange-600",
        },
        {
          title: "Anuncios",
          path: "/ads",
          icon: Megaphone,
          color: "text-orange-500",
        },
        {
          title: "Clips",
          path: "/clips",
          icon: PlayCircle,
          color: "text-violet-600",
        },
      ],
    },
    {
      title: "Streaming",
      icon: Video,
      color: "text-red-600",
      items: [
        {
          title: "Metro Streamers",
          path: "/streamers",
          icon: Video,
          color: "text-red-600",
        },
        {
          title: "Metro Sessions",
          path: "/sessions",
          icon: Music,
          color: "text-teal-600",
        },
        // {
        //   title: "Streaming Health",
        //   path: "/streaming-health",
        //   icon: Activity,
        //   color: "text-cyan-600",
        // },
        // {
        //   title: "Analytics Streaming",
        //   path: "/streaming-analytics",
        //   icon: TrendingUp,
        //   color: "text-purple-600",
        // },
      ],
    },
    {
      title: "RADIO.ai",
      path: "/radio-ai",
      icon: Radio,
      color: "text-pink-600",
    },
    {
      title: "Educación",
      path: "/education",
      icon: BookOpen,
      color: "text-indigo-600",
    },
    // {
    //   title: "ESTUD.IA",
    //   path: "/estud-ia",
    //   icon: Brain,
    //   color: "text-purple-600",
    // },
    {
      title: "Marketplace",
      path: "/marketplace",
      icon: Package,
      color: "text-emerald-600",
    },
    {
      title: "Trabajos",
      path: "/jobs",
      icon: Briefcase,
      color: "text-indigo-600",
    },
    {
      title: "Finanzas",
      icon: CreditCard,
      color: "text-green-600",
      items: [
        // {
        //   title: "Donaciones",
        //   path: "/donations",
        //   icon: Heart,
        //   color: "text-red-600",
        // },
        {
          title: "Pagos Yape/Plin",
          path: "/yape-plin-payments",
          icon: CreditCard,
          color: "text-green-600",
        },
        // {
        //   title: "Canjes",
        //   path: "/redemptions",
        //   icon: Gift,
        //   color: "text-emerald-600",
        // },
        {
          title: "Suscripciones",
          path: "/subscriptions",
          icon: CreditCard,
          color: "text-purple-600",
        },
      ],
    },
    {
      title: "Recompensas",
      icon: Star,
      color: "text-yellow-600",
      items: [
        // {
        //   title: "Points",
        //   path: "/points",
        //   icon: Star,
        //   color: "text-yellow-600",
        // },
        {
          title: "Cupones Metro Ya",
          path: "/metro-ya-coupons",
          icon: Ticket,
          color: "text-purple-600",
        },
        {
          title: "Descuentos Metro",
          path: "/metro-discounts",
          icon: Ticket,
          color: "text-purple-600",
        },
        {
          title: "Metro Premium",
          path: "/premium",
          icon: Star,
          color: "text-amber-600",
        },
      ],
    },
    {
      title: "Servicios",
      icon: Shield,
      color: "text-teal-600",
      items: [
        // {
        //   title: "Voto Seguro",
        //   path: "/voto-seguro",
        //   icon: Vote,
        //   color: "text-blue-500",
        // },
        {
          title: "Microseguros",
          path: "/microseguros",
          icon: Shield,
          color: "text-teal-600",
        },
      ],
    },
    {
      title: "Administración",
      icon: Users,
      color: "text-gray-600",
      items: [
        {
          title: "Usuarios",
          path: "/users",
          icon: Users,
          color: "text-green-600",
        },
        // {
        //   title: "Notificaciones",
        //   path: "/notifications",
        //   icon: Bell,
        //   color: "text-blue-600",
        // },
        // {
        //   title: "Provider Analytics",
        //   path: "/provider-analytics",
        //   icon: BarChart3,
        //   color: "text-fuchsia-600",
        // },
        // {
        //   title: "API Testing",
        //   path: "/api-testing",
        //   icon: TestTube,
        //   color: "text-red-600",
        // },
      ],
    },
  ];

  const isActive = (path: string): boolean => location.pathname === path;

  const toggleGroup = (title: string): void => {
    if (isCollapsed) return;
    setExpandedGroups((prev) =>
      prev.includes(title)
        ? prev.filter((g) => g !== title)
        : [...prev, title]
    );
  };

  const isGroupActive = (items: MenuItem[]): boolean => {
    return items.some((item) => isActive(item.path));
  };

  const toggleCollapse = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    if (isCollapsed) {
      return (
        <Link
          key={item.path}
          to={item.path}
          onClick={onClose}
          className={`
            flex items-center justify-center p-3 rounded-lg transition-all duration-200 group
            ${
              active
                ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }
          `}
          title={item.title}
        >
          <Icon className={`h-5 w-5 ${active ? "text-white" : item.color}`} />
        </Link>
      );
    }

    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={onClose}
        className={`
          flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
          ${
            active
              ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }
        `}
      >
        <Icon
          className={`h-4 w-4 flex-shrink-0 ${
            active ? "text-white" : item.color
          } group-hover:scale-110 transition-transform`}
        />
        <span className="text-sm font-medium flex-1">{item.title}</span>
      </Link>
    );
  };

  const renderMenuGroup = (group: MenuGroup) => {
    const Icon = group.icon;
    const isExpanded = expandedGroups.includes(group.title);
    const hasActiveItem = isGroupActive(group.items);

    if (isCollapsed) {
      return (
        <div key={group.title} className="relative group">
          <div
            className={`
              flex items-center justify-center p-3 rounded-lg cursor-pointer
              ${
                hasActiveItem
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-50"
              }
            `}
            title={group.title}
          >
            <Icon className={`h-5 w-5 ${hasActiveItem ? "text-white" : group.color}`} />
          </div>
        </div>
      );
    }

    return (
      <div key={group.title}>
        <button
          onClick={() => toggleGroup(group.title)}
          className={`
            w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
            ${
              hasActiveItem
                ? "bg-primary-50 text-primary-700"
                : "text-gray-700 hover:bg-gray-50"
            }
          `}
        >
          <Icon
            className={`h-4 w-4 flex-shrink-0 ${
              hasActiveItem ? "text-primary-600" : group.color
            } group-hover:scale-110 transition-transform`}
          />
          <span className="text-sm font-medium flex-1 text-left">
            {group.title}
          </span>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </button>

        {isExpanded && (
          <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-2">
            {group.items.map(renderMenuItem)}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Overlay móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-30 bg-white border-r border-gray-200
        transform transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${isCollapsed ? "w-20" : "w-72"}
        flex flex-col
      `}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between p-5 border-b border-gray-200">
          {!isCollapsed ? (
            <>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl shadow-lg">
                  <span className="text-white font-bold text-xl">T</span>
                </div>
                <div>
                  <span className="block text-lg font-bold text-gray-900">Telemetro</span>
                  <span className="block text-xs text-gray-500">Admin Panel</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                type="button"
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </>
          ) : (
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl shadow-lg mx-auto">
              <span className="text-white font-bold text-xl">T</span>
            </div>
          )}

          {/* Botón collapse - Desktop - Posición absoluta */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all shadow-md z-10"
            type="button"
            aria-label={isCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
            title={isCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuGroups.map((item) =>
            "items" in item ? renderMenuGroup(item) : renderMenuItem(item)
          )}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-4 text-white shadow-lg">
              <h4 className="font-semibold mb-1">Admin Panel v2.0</h4>
              <p className="text-xs text-primary-100">Sistema moderno con React</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </>
  );
};

export default Sidebar;