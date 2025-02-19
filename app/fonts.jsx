import { Inter, Montserrat, Montserrat_Alternates, Roboto_Mono } from 'next/font/google'
 
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})
 
export const roboto_mono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
})

//FAT monserrat
export const montserrat = Montserrat({
    weight: ['800'],
    subsets: ['latin'],
    display:'swap',
    fallback: ['Arial', 'sans-serif'],
  });

//SKINNY monserrat
  export const montserrat_regular = Montserrat({
    weight: ['400'], // Regular weight
    subsets: ['latin'],
    display: 'swap',
    fallback: ['Arial', 'sans-serif'],
  });