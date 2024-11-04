import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';

import Header from '../Header.jsx';
import { useQuery, useMutation } from '@tanstack/react-query';
import { deleteEvent, fetchEvent, queryClient } from '../../utils/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import { useState } from 'react';
import Modal from '../UI/Modal.jsx';

export default function EventDetails() {
  const [isDelete, setIsDelete] = useState(false)
  const params = useParams()
  const navigate = useNavigate()
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id })
  })

  const { mutate, isPending: isPendingDeletion, isError: isDeletionError, error: deleteError } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['events'],
        refetchType: 'none'
      })
      navigate('/events')
    }
  })

  function handleStartDelete() {
    setIsDelete(true)
  }

  function handlestopDelete() {
    setIsDelete(false)
  }

  function handleDelete() {
    mutate({ id: params.id })
  }

  let content;

  if (isPending) {
    content = <div id='event-details-content' className='center'>
      <p>fetching event data...</p>
    </div>
  }

  if (isError) {
    content = <div id='event-details-content' className='center'>
      <ErrorBlock title="Failed to load event" message={error.info?.message || 'Failed to fetch event data, please try again later'} />
    </div>
  }

  if (data) {

    const formatteddate = new Date(data.date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    })

    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>{formatteddate} @ {data.time}</time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {isDelete && <Modal onClose={handlestopDelete}>
        <h2>Are you sure?</h2>
        <p>Do you really want to delete?</p>
        <div className='form-actions'>
          {isPendingDeletion && <p>Deleting, please wait...</p>}
          {!isPendingDeletion && (
            <>
              <button onClick={handlestopDelete} className='button-text'>
                cancle
              </button>
              <button onClick={handleDelete} className='button'>
                Delete
              </button>
            </>
          )}
        </div>
        {isDeletionError && <ErrorBlock title="Fail to delete event" message={deleteError.info?.message || 'Fail to delete evnt, try again later...!'} />}
      </Modal>}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
        {content}
      </article>
    </>
  );
}
