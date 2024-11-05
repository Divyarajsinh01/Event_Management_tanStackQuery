import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useMutation } from '@tanstack/react-query';
import { createNewEvent, queryClient } from '../../utils/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';

export default function NewEvent() {
  const navigate = useNavigate();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createNewEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate('/events');
    },
    onError: () => {
      setShowErrorModal(true);
    }
  });

  function handleSubmit(formData) {
    mutate({ event: formData });
  }

  return (
    <>
      {/* Error modal, only shown if there's an error and showErrorModal is true */}
      {isError && showErrorModal && (
        <Modal onClose={() => setShowErrorModal(false)}>
          <ErrorBlock
            title="Failed to create event"
            message={error.info?.message || 'Failed to create event. Please check your inputs and try again later.'}
          />
          <button className="button" onClick={() => setShowErrorModal(false)}>
            Close
          </button>
        </Modal>
      )}
      <Modal onClose={() => navigate('../')}>
        <EventForm onSubmit={handleSubmit}>
          {isPending && 'Submitting...'}
          {!isPending && (
            <>
              <Link to="../" className="button-text">
                Cancel
              </Link>
              <button type="submit" className="button">
                Create
              </button>
            </>
          )}
        </EventForm>
      </Modal>
    </>
  );
}
