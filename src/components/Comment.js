import { modalState, postIdState } from '@/atoms/modalAtom'
import { userState } from '@/atoms/userAtom'
import { db } from '@/firebase'
import { ChartBarIcon, ChatBubbleOvalLeftIcon, HeartIcon, ShareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { EllipsisHorizontalIcon, HeartIcon as HeartIconFill } from '@heroicons/react/24/solid'
import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Moment from 'react-moment'
import { useRecoilState } from 'recoil'

export default function Comment({comment, commentId, oPostId}) {

	const router = useRouter()

	const [currentUser, setCurrentUser] = useRecoilState(userState)
	const [open, setOpen] = useRecoilState(modalState)
	const [postId, setPostId] = useRecoilState(postIdState)
	
	
	const [likes, setLikes] = useState([])
	const [hasLiked, setHasLiked] = useState(false)

	useEffect(() => {
        const unsubscribe = onSnapshot(
			collection(db, "posts", oPostId, "comments", commentId, "likes"), (snapshot) => setLikes(snapshot.docs)
		)
	},[oPostId, commentId])

	useEffect(() => {
		setHasLiked(likes.findIndex((like) => like.id === currentUser?.uid) !== -1)
	},[likes, currentUser?.uid])

	const likeComment = async() => {
		if (currentUser) {
			if(hasLiked) {
				await deleteDoc(doc(db, "posts", oPostId, "comments", commentId, "likes", currentUser?.uid))
			} else {
				await setDoc(doc(db, "posts", oPostId, "comments", commentId, "likes", currentUser?.uid), {
					username: currentUser.username
				})
			}
		} else {
			router.push("/auth/signin")
		}
	}

	const deleteComment = async() => {
		if (currentUser) {
			if(window.confirm("Are you sure you want to delete")) {
				await deleteDoc(doc(db, "posts", oPostId, "comments", commentId))
			}
        } else {
            router.push("/auth/signin")
        }
	}

	const makeComment = async() => {
		if (currentUser) {
			setPostId(oPostId);
			setOpen(!open);
        } else {
            router.push("/auth/signin")
        }
	}

	return (
		<div className='flex p-3 cursor-pointer border-b border-gray-200 pl-20'>

			<img className='h-11 w-11 rounded-full mr-4' src={comment?.userImg} alt="user-image"/>
			
			<div className='flex-1'>

				<div className='flex items-center justify-between'>
					<div className='flex space-x-1 whitespace-nowrap items-center'>
						<h4 className='font-bold text-[15px] sm:text-[16px] hover:underline'>{comment?.name}</h4>
						<span className='text-sm sm:text-[15px]'>@{comment?.username} - </span>
						<span className='text-sm sm:text-[15px] hover:underline'>
							<Moment fromNow>
								{comment?.timestamp?.toDate()}
							</Moment>	
						</span>
					</div>
					<EllipsisHorizontalIcon className='h-10 hoverEffect w-10 hover:bg-sky-100 hover:text-sky-500 p-2'/>
				</div>

				<p className='text-gray-800 text-[15px] sm:text-[16px] mb-2'>{comment?.comment}</p>

				<div className='flex justify-between text-gray-500 p-2'>
					<div className='flex items-center'>
						<ChatBubbleOvalLeftIcon className='h-9 w-9 hoverEffect p-2 hover:text-sky-500 hover:bg-sky-100' onClick={makeComment}/>
						
					</div>
					{
						currentUser?.uid === comment?.userId && (
							<TrashIcon className='h-9 w-9 hoverEffect p-2 hover:text-red-600 hover:bg-red-100' onClick={deleteComment} />
						)
					}

					<div className='flex items-center'>
						{
							hasLiked ? (
								<HeartIconFill className='h-9 w-9 hoverEffect p-2 text-red-600 hover:bg-red-100' onClick={likeComment} />
							) : (
								<HeartIcon className='h-9 w-9 hoverEffect p-2 hover:text-red-600 hover:bg-red-100' onClick={likeComment} />
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
