import { Button, Modal } from 'flowbite-react';
import { useState } from 'react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

export default function CustomModalConfirm(props) {
	const { textConfirm, openModal, onClose, performAction } = props;
	return (
		<>
			<Modal show={openModal} size='md' onClose={onClose} popup>
				<Modal.Header />
				<Modal.Body>
					<div className='text-center'>
						<HiOutlineExclamationCircle className='mx-auto mb-4 h-14 w-14 text-red-500 dark:text-gray-200' />
						<h3 className='mb-5 text-lg font-normal text-gray-500 dark:text-gray-400'>
							{textConfirm}
						</h3>
						<div className='flex justify-center gap-4'>
							<Button color='failure' onClick={performAction}>
								Xác nhận
							</Button>
							<Button color='gray' onClick={onClose}>
								Huỷ bỏ
							</Button>
						</div>
					</div>
				</Modal.Body>
			</Modal>
		</>
	);
}
