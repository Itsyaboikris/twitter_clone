import Image from 'next/image'
import { Inter } from 'next/font/google'
import Sidebar from '@/components/Sidebar'
import Feed from '@/components/Feed'
import Widgets from '@/components/Widgets'
import CommentModal from '@/components/CommentModal'

const inter = Inter({ subsets: ['latin'] })

export default function Home({newsResults, randomUsersResults}) {
	return (
		<main className='flex min-h-screen mx-auto'>
			<Sidebar/>
			<Feed/>
			<Widgets newsResults={newsResults.articles} randomUsersResults={randomUsersResults?.results || null} />
			<CommentModal/>
		</main>
	)
}

// https://saurav.tech/NewsAPI/top-headlines/category/business/us.json

export async function getServerSideProps() {
	const newsResults = await fetch ("https://saurav.tech/NewsAPI/top-headlines/category/business/us.json").then ((res) => res.json())

	let randomUsersResults = [];

	try {
		const res = await fetch(
		  "https://randomuser.me/api/?results=30&inc=name,login,picture"
		);
	
		randomUsersResults = await res.json();
	  } catch (e) {
		randomUsersResults = [];
	}

	return{
		props: {
			newsResults,
			randomUsersResults
		}
	}
}