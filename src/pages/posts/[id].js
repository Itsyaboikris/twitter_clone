import Sidebar from '@/components/Sidebar'
import Widgets from '@/components/Widgets'
import CommentModal from '@/components/CommentModal'
import Post from '@/components/Post'
import { useRouter } from 'next/router'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '@/firebase'
import Comment from '@/components/Comment'


export default function PostPage({newsResults, randomUsersResults}) {
	
	const router = useRouter();
	const {id} = router.query;
	const [post, setPost] = useState(null)
	const [comment, setComment] = useState([])

	useEffect(()=>
		onSnapshot(doc(db, "posts", id), (snapshot) => setPost(snapshot))
	,[id])

	useEffect(() => {
		onSnapshot(query(collection(db,"posts", id, "comments"), orderBy("timestamp","desc")),(snapshot) => setComment(snapshot.docs))
	}, [id])

	console.log(comment)
	
	return (
		<main className='flex min-h-screen mx-auto'>
			<Sidebar/>
			<div className='xl:ml-[370px] border-l border-r border-gray-200 xl:min-w-[576px] sm:ml-[73px] flex-grow max-w-xl'>
		
			<div className='flex items-center space-x-2 py-2 px-3 sticky top-0 z-50 bg-white border-b border-gray-200'>
				<div className='hoverEffect' onClick={()=>router.push('/')}>
					<ArrowLeftIcon className='h-5 ' />
				</div>
				<h2 className='text-lg sm:text-xl font-bold cursor-pointer'>Tweet</h2>
			</div>
            
			<Post id={id} post={post}/>

			{
				comment.length > 0 && (
					<div className=''>
						{
							comment.map((com)=> (
								<Comment key={com?.id} commentId={com?.id} oPostId={id} comment={com?.data()} />
							))
						}
					</div>
				)
			}
		</div>
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