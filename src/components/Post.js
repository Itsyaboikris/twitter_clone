import { modalState, postIdState } from '@/atoms/modalAtom'
import { db, storage } from '@/firebase'
import { ChartBarIcon, ChatBubbleOvalLeftIcon, HeartIcon, ShareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { EllipsisHorizontalIcon, HeartIcon as HeartIconFill } from '@heroicons/react/24/solid'
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { deleteObject, ref } from 'firebase/storage'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Moment from 'react-moment'
import { useRecoilState } from 'recoil'

export default function Post({post, id}) {

	const router = useRouter()
	const {data: session} = useSession()

	const [open, setOpen] = useRecoilState(modalState)
	const [postId, setPostId] = useRecoilState(postIdState)
	
	const [comments, setComments] = useState([])
	const [likes, setLikes] = useState([])
	const [hasLiked, setHasLiked] = useState(false)

	useEffect(() => {
        const unsubscribe = onSnapshot(
			collection(db, "posts", id, "comments"), (snapshot) => setComments(snapshot.docs)
		)
	},[comments, id])

	useEffect(() => {
        const unsubscribe = onSnapshot(
			collection(db, "posts", id, "likes"), (snapshot) => setLikes(snapshot.docs)
		)
	},[])

	useEffect(() => {
		setHasLiked(likes.findIndex((like) => like.id === session?.user.uid) !== -1)
	},[likes,session?.user.uid])

	const likePost = async() => {
		if (session) {
			if(hasLiked) {
				await deleteDoc(doc(db, "posts", id, "likes", session?.user.uid))
			} else {
				await setDoc(doc(db, "posts", id, "likes", session?.user.uid), {
					username: session.user.username
				})
			}
		} else {
			signIn()
		}
	}

	const deletePost = async() => {
		if (session) {
			if(window.confirm("Are you sure you want to delete")) {
				await deleteDoc(doc(db, "posts", id))
				await deleteObject(ref(storage, `posts/${id}/image`))
				router.push('/')
			}
        } else {
            signIn()
        }
	}

	const makeComment = async() => {
		if (session) {
			setPostId(id);
			setOpen(!open);
        } else {
            signIn()
        }
	}

	return (
		<div className='flex p-3 cursor-pointer border-b border-gray-200'>

			<img className='h-11 w-11 rounded-full mr-4' src={post?.data()?.userImg} alt="user-image"/>
			
			<div className='flex-1'>

				<div className='flex items-center justify-between'>
					<div className='flex space-x-1 whitespace-nowrap items-center'>
						<h4 className='font-bold text-[15px] sm:text-[16px] hover:underline'>{post?.data()?.name}</h4>
						<span className='text-sm sm:text-[15px]'>@{post?.data()?.username} - </span>
						<span className='text-sm sm:text-[15px] hover:underline'>
							<Moment fromNow>
								{post?.data()?.timestamp?.toDate()}
							</Moment>	
						</span>
					</div>
					<EllipsisHorizontalIcon className='h-10 hoverEffect w-10 hover:bg-sky-100 hover:text-sky-500 p-2'/>
				</div>

				<p className='text-gray-800 text-[15px] sm:text-[16px] mb-2' onClick={()=>router.push(`/posts/${id}`)}>{post?.data()?.text}</p>

				<img className='rounded-2xl mr-2' src={post?.data()?.image} alt="" onClick={()=>router.push(`/posts/${id}`)} />

				<div className='flex justify-between text-gray-500 p-2'>
					<div className='flex items-center'>
						<ChatBubbleOvalLeftIcon className='h-9 w-9 hoverEffect p-2 hover:text-sky-500 hover:bg-sky-100' onClick={makeComment}/>
						{
							comments.length > 0 && (
								<span className={`text-sm select-none`}>{comments.length}</span>
							)
						}
					</div>
					{
						session?.user.uid === post?.data()?.id && (
							<TrashIcon className='h-9 w-9 hoverEffect p-2 hover:text-red-600 hover:bg-red-100' onClick={deletePost} />
						)
					}

					<div className='flex items-center'>
						{
							hasLiked ? (
								<HeartIconFill className='h-9 w-9 hoverEffect p-2 text-red-600 hover:bg-red-100' onClick={likePost} />
							) : (
								<HeartIcon className='h-9 w-9 hoverEffect p-2 hover:text-red-600 hover:bg-red-100' onClick={likePost} />
							)					
						}
						{
							likes.length > 0 && (
								<span className={`${hasLiked && "text-red-600"} text-sm select-none`}>{likes.length}</span>
							)
						}
					</div>
					
					<ShareIcon className='h-9 w-9 hoverEffect p-2 hover:text-sky-500 hover:bg-sky-100'/>
					<ChartBarIcon className='h-9 w-9 hoverEffect p-2 hover:text-sky-500 hover:bg-sky-100' />
				</div>

			</div>

		</div>
	)
}
