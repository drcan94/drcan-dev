import { type Metadata } from "next";
import {
  Github,
  Linkedin,
  Mail,
  Twitter,
  BookOpen,
  Stethoscope,
  Code,
  Brain,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Hakkımda - DrCan.dev",
  description: "Dr. Burak Can hakkında daha fazla bilgi edinin.",
};

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/drcan94",
    icon: Github,
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/drcan94",
    icon: Linkedin,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/drcan94",
    icon: Twitter,
  },
  {
    name: "E-posta",
    href: "mailto:drcan94@gmail.com",
    icon: Mail,
  },
];

const educationExperience = [
  {
    period: "2013 - 2017",
    title: "Tıp Fakültesi",
    institution: "Atatürk Üniversitesi",
    description:
      "Tıp eğitimime Atatürk Üniversitesi'nde başladım ve dördüncü sınıfa kadar burada eğitim aldım.",
  },
  {
    period: "2017 - 2023",
    title: "Tıp Fakültesi",
    institution: "Sakarya Üniversitesi",
    description:
      "Tıp eğitimime Sakarya Üniversitesi'nde devam ederek Ocak 2023'te tıp doktoru ünvanı ile mezun oldum.",
  },
  {
    period: "2023 - 2024",
    title: "Pratisyen Hekim",
    institution: "Konya İl Sağlık Müdürlüğü",
    description:
      "Mecburi hizmet görevim kapsamında Mart 2023'te Konya Taşkent'e atandım. Taşkent, Hadim, Bozkır ilçeleri ve Beyhekim Devlet Hastanesi'nde görevlendirmelerle çalıştım. Nisan 2023'te Maraş depremi sonrası 15 günlük Hatay görevlendirmem oldu.",
  },
  {
    period: "Eylül 2024",
    title: "Anesteziyoloji ve Reanimasyon Asistanı",
    institution: "Necmettin Erbakan Üniversitesi Meram Tıp Fakültesi",
    description:
      "Kısa bir süre anestezi asistanlığına başladım ancak uzmanlık eğitiminden feragat ederek pratisyenliğe döndüm.",
  },
  {
    period: "Ocak 2025 - Günümüz",
    title: "Pratisyen Hekim",
    institution: "Karaman Eğitim ve Araştırma Hastanesi",
    description:
      "Karaman Eğitim ve Araştırma Hastanesi acil servisinde pratisyen hekim olarak görev yapmaktayım.",
  },
  {
    period: "2020 - Günümüz",
    title: "Yazılım Geliştirici",
    institution: "Serbest",
    description:
      "COVID-19 pandemisi sırasındaki kapanma döneminde (Nisan 2020) yazılım geliştirmeye başladım. Özellikle web teknolojileri üzerinde çalışıyorum ve modern frontend/backend çözümleri geliştiriyorum.",
  },
];

const interests = [
  {
    title: "Tıp ve Sağlık Teknolojileri",
    icon: Stethoscope,
    description:
      "Tıbbi uygulamaları iyileştiren teknolojik yenilikler ve dijital sağlık çözümleri üzerine çalışmalar.",
  },
  {
    title: "Web Geliştirme",
    icon: Code,
    description:
      "Modern frontend ve backend teknolojileri kullanarak kullanıcı dostu, erişilebilir web uygulamaları geliştirme.",
  },
  {
    title: "Yapay Zeka ve Veri Bilimi",
    icon: Brain,
    description:
      "Sağlık alanında yapay zeka uygulamaları, veri analizi ve makine öğrenimi modelleri geliştirme.",
  },
  {
    title: "Bilimsel Araştırmalar",
    icon: BookOpen,
    description:
      "Tıp ve teknoloji kesişimindeki yeni gelişmeleri takip etme, araştırma ve öğrenmeye sürekli açık olma.",
  },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-4xl font-bold">Hakkımda</h1>

        {/* Hero Section */}
        <div className="mb-16 overflow-hidden rounded-xl border bg-card shadow-lg">
          <div className="md:flex">
            <div className="md:w-1/3">
              <div className="h-full w-full overflow-hidden">
                <Image
                  src="/me.jpg"
                  alt="Dr. Burak Can"
                  width={400}
                  height={600}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
            </div>
            <div className="p-8 md:w-2/3">
              <h2 className="mb-4 text-3xl font-bold">Dr. Burak Can</h2>
              <h3 className="mb-6 text-xl text-muted-foreground">
                Tıp Doktoru & Yazılım Geliştirici
              </h3>

              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p>
                  Merhaba, ben Dr. Burak Can. Tıp doktoru ve yazılım geliştirici
                  olarak iki farklı dünyada faaliyet gösteriyorum.
                </p>

                <p>
                  Tıp eğitimimi Atatürk ve Sakarya Üniversitelerinde
                  tamamladıktan sonra, çeşitli hastanelerde görev aldım. Şu anda
                  Karaman Eğitim ve Araştırma Hastanesi'nde pratisyen hekim
                  olarak çalışmaktayım. 2020 yılında, COVID-19 pandemisi
                  sırasında yazılım geliştirmeye ilgi duymaya başladım ve bu
                  alanda kendimi sürekli geliştiriyorum.
                </p>

                <p>
                  Bu blogda, tıp ve yazılım alanındaki deneyimlerimi,
                  öğrendiklerimi ve düşüncelerimi paylaşıyorum. İki alanın
                  kesişim noktasındaki yenilikçi fikirleri ve projeleri ele
                  almayı seviyorum.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Eğitim ve Deneyim */}
        <div className="mb-16">
          <h2 className="mb-6 text-3xl font-bold">Eğitim & Deneyim</h2>
          <Accordion type="single" collapsible>
            {educationExperience.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="mb-3 overflow-hidden rounded-lg border bg-card"
              >
                <AccordionTrigger className="px-6 py-3 hover:no-underline">
                  <div className="flex w-full flex-col items-start text-left sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-primary">
                        {item.title}
                      </h3>
                      <p className="text-base font-medium">
                        {item.institution}
                      </p>
                    </div>
                    <span className="mt-1 text-sm font-medium text-muted-foreground sm:mt-0">
                      {item.period}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 text-muted-foreground">
                  {item.description}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* İlgi Alanları */}
        <div className="mb-16">
          <h2 className="mb-6 text-3xl font-bold">İlgi Alanlarım</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {interests.map((interest, index) => {
              const Icon = interest.icon;
              return (
                <div
                  key={index}
                  className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <Icon className="h-10 w-10 text-primary" />
                    <h3 className="text-xl font-medium">{interest.title}</h3>
                  </div>
                  <p className="text-muted-foreground">
                    {interest.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* İletişim */}
        <div className="rounded-xl border bg-card p-8">
          <h2 className="mb-6 text-3xl font-bold">İletişim</h2>
          <p className="mb-6 text-lg text-muted-foreground">
            Projelerim, fikirlerim veya olası işbirlikleri hakkında benimle
            iletişime geçmekten çekinmeyin.
          </p>
          <div className="flex flex-wrap gap-4">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Button
                  key={link.name}
                  variant="outline"
                  size="lg"
                  asChild
                  className="gap-2"
                >
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    <Icon className="h-4 w-4" />
                    {link.name}
                  </a>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
