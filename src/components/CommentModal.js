import React, { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { modalState, postIdState } from "../atoms/modalAtom"
import Modal  from 'react-modal'
import { FaceSmileIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { addDoc, collection, doc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import Moment from 'react-moment'
import { useRouter } from 'next/router'
import { userState } from '@/atoms/userAtom'

export default function CommentModal() {

	const router = useRouter()

	const [currentUser, setCurrentUser] = useRecoilState(userState)
	const [open, setOpen] = useRecoilState(modalState)
	const [postId, setPostId] = useRecoilState(postIdState)

	const [post, setPost] = useState({})
	const [input, setInput] = useState("")
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		onSnapshot(doc(db, "posts", postId), (snaphot) => {
			setPost(snaphot)
		})
	}, [postId])

	const sendComment = async () => {
		await addDoc(collection(db, "posts", postId, "comments"), {
			comment: input,
			name: currentUser.name,
			username: currentUser.username,
			userImg: currentUser.userImg,
			timestamp: serverTimestamp(),
			userId: currentUser.uid,
		})

		setInput("")
		setOpen(false)
		router.push(`/posts/${postId}`)
	}

	return (
		<div>
			{
				open && (
					<Modal isOpen={open} onRequestClose={()=>setOpen(false)} className="max-w-lg w-[90%] absolute top-24 left-[50%] translate-x-[-50%] bg-white border-1 border-gray-200 rounded-xl shadow-md">
						<div className='p-1'>
							<div className='border-b border-gray-200 py-2 px-1.5'>
								<div className='hoverEffect w-10 h-10 flex items-center justify-center' onClick={()=>setOpen(false)}>
									<XMarkIcon className='h-[23px] text-gray-700 p-0' />
								</div>
							</div>

							<div className='p-2 flex items-center space-x-1 relative'>
								<span className='w-0.5 h-full z-[-1] absolute left-8 top-11 bg-gray-300'/>
								<img className='h-11 w-11 rounded-full mr-4' src={post?.data()?.userImg} alt="user-image"/>
								<h4 className='font-bold text-[15px] sm:text-[16px] hover:underline'>{post?.data()?.name}</h4>
								<span className='text-sm sm:text-[15px]'>@{post?.data()?.username} - </span>
								<span className='text-sm sm:text-[15px] hover:underline'>
									<Moment fromNow>
										{post?.data()?.timestamp.toDate()}
									</Moment>	
								</span>
							</div>

							<p className='text-gray-500 text-[15px] sm:text-[16px] ml-16 mb-2'>{post?.data()?.text}</p>

							{
								<div className='flex p-3 space-x-3'>
									<img className='h-11 w-11 rounded-full cursor-pointer hover:brightness-95' src={currentUser.userImg} alt='user image' />

									<div className='w-full divide-y divide-gray-200' >
										<div className='' >
											<textarea className='w-full border-none focus:ring-0 text-lg placeholder-gray-700 tracking-wide min-h-[50px] text-grey-700' rows='2' placeholder="Tweet your reply" value={input} onChange={(e)=>setInput(e.target.value)}></textarea>
										</div>
										
										<div className='flex items-center justify-between pt-2.5' >
											
											<div className='flex ' >
												<div>
													<PhotoIcon className='h-10 w-10 hover hoverEffect p-2 text-sky-500 hover:bg-sky-100' />
												</div>
												<FaceSmileIcon className='h-10 w-10 hoverEffect p-2 text-sky-500 hover:bg-sky-100' />
											</div>
											<button className='bg-blue-400 text-white px-5 py-1.5 rounded-full font-bold shadow-md hover:brightness-95 disabled:opacity-50' disabled={!input.trim()} onClick={sendComment}>Reply</button>
								
										</div>
									</div>
								</div>
							}
							
						</div>
					</Modal>
				)
			}
		</div>
	)
}
