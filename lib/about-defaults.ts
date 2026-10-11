import type { AboutEntri } from "./profile";

// Teks bawaan About. Dipakai kalau admin belum mengisi (nilai null).
// Harus sama persis dengan tampilan About sebelum fitur admin dibuat.
export const ABOUT_DEFAULT: {
  name: string;
  description: string;
  experience: AboutEntri[];
  education: AboutEntri[];
} = {
  name: "Evi Fauziah",
  description:
    "Lulusan Teknik Informatika yang tertarik pada dunia data analysis. Aku suka menelusuri data, mulai dari proses eksplorasi hingga menyajikannya dalam visualisasi yang jelas dan mudah dipahami. Aku memiliki antusiasme besar untuk terus belajar dari pengalaman baru, bertumbuh, dan berkontribusi lewat insight yang bermanfaat.",
  experience: [
    {
      year: "2024",
      title: "Machine Learning Cohort",
      detail: "Bangkit Academy by Google, GoTo, Traveloka",
      show: true,
    },
  ],
  education: [
    {
      year: "2022 – 2026",
      title: "Universitas Teknologi Bandung (UTB)",
      detail: "Sarjana Komputer · Teknik Informatika",
      show: true,
    },
  ],
};