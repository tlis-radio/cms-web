import React from 'react';
import tlisteam from '@/../public/images/tlis-team.jpg';

const AboutUs: React.FC = () => {
    return (
        <>
            <pre className='font-argentumSansMedium text-white text-2xl'>
                O   N Á S
            </pre>
            <br />
            <p className='font-argentumSansRegular text-white'>
                Lorem ipsum, dolor sit amet consectetur adipisicing elit. Omnis, voluptates. Consequuntur non, rerum dolorem alias iste dolorum beatae nostrum, minus eos, eveniet amet quis? Possimus quaerat nihil sed maiores delectus.
            </p>
            <br />
            <p className='font-argentumSansRegular text-white'>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Pariatur cumque, maxime quisquam laudantium consequuntur modi! Error dolorem voluptates dolore, vel corporis placeat rem nemo dignissimos, possimus ex facere. Voluptatem, reprehenderit?
            </p>
            <br />
            <p className='font-argentumSansRegular text-white'>
                Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quos est excepturi perspiciatis optio neque provident repellat reiciendis nesciunt accusamus odio, molestiae iste aperiam necessitatibus officia quasi, voluptates doloremque eligendi error!
            </p>
            <br />
            <pre className='font-argentumSansMedium text-white text-2xl'>
                Č O   J E   N A Š Í M   P O S L A N Í M ?
            </pre>
            <br />
            <img src={tlisteam.src} alt="Tlispyčy :)" />
            <br />
        </>
    );
};

export default AboutUs;