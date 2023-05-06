import React from 'react'
import { useRecoilState } from 'recoil'
import { modalState } from "../atoms/modalAtom"

export default function CommentModal() {

	const [open, setOpen] = useRecoilState(modalState)

	return (
		<div>
		
		</div>
	)
}
