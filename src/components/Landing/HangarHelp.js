import React from 'react';
import { Typography } from "antd";
const { Title } = Typography;


export const HangarHelp = {
    title: 'Welcome',
    size: "full",
    content:
        (<div><p>Thanks for joining in, having a look, testing this prototype out, and making your own galleries!</p>
            <Title level={4}>Builder</Title>
            <ol>
                <li>Jump to the Builder to make your own gallery.</li>
                <li>Under New Gallery you can select a pre-made floorplan.</li>
                <li>Fill in details and pick a location. Set it to public to let it appear on the map.</li>
                <li>Drag an image from your desktop directly onto the wall.</li>
                <li>Your Vault is at the bottom of the Builder page and in it are all the images you've uploaded and different floors, frames, walls etc which you can add.</li>
                <li>Your images in the Vault have an edit icon to allow you to add titles, descriptions and other details.</li>
                <li>You can make as many galleries as you like and update them as often as you like.</li>
            </ol>

            <Title level={4}>Floorplan</Title>
            <p>You can create and edit you're own floorplans to build on.</p>
            <Title level={4}>Studio</Title>
            <p>The Studio is where you can create and edit the different materials you use in your gallery or galleries, like frames, flooring. You can also upload your own textures.
    </p>

            <Title level={4}>Philosophy</Title>
            <p>The internet is a flatland of images dominated by timelines. There is nothing out there to properly curate a display of images,
            to create particular narratives and emphasize particular images, to create an experience for viewers that has a physical sense of discovery.
      </p>
            <p>I've been encouraged by the enthusiastic expression of interest from most people I've discussed this with. People have come to me with many ideas for applications of the idea I'd never thought of, including:</p>
            <ul>
                <li>Parents would like Galleries to show off their children's art to other parents and family</li>
                <li>Someone organizing an online memorial said it would be good to be able to curate images from a loved one's life</li>
                <li>An environmental scientist wanted to be able to display photos of the plant specimens, both for presentation and as an aid to memorizing them</li>
                <li>Artists want a better way to show their work to prospective customers and galleries</li>
            </ul>

            <p>I want to build up a community and create an enjoyable way for citizens of this world to discover the work of friends and strangers... a safe way, in this era of the coronavirus.</p>
            <p>Hangar, if that's what it is to be called, will always be mainly free. I'm still thinking through the best way to monetize it... possibly subscriptions for advanced features and/or a cut from sales. </p>

            <Title level={4}>Roadmap</Title>
            <ul>
                <li>Fix the big bugs - let me know the buggiest ones, please</li>
            </ul>
            <p>These are the features I'm moving to next but am keen to hear what would make this work better for you</p>
            <ul>
                <li>Tours - so users can glide through your gallery in a simple way of your design</li>
                <li>Video - on the walls</li>
                <li>Sculpture - 3D art</li>
                <li>Shareable art and materials - a user borrows a work from someone else's gallery, and viewers of the borrowed work can use it as a portal to visit the original owner's gallery</li>
                <li>Open studios - monthly shows highlghting works from the community</li>
                <li>Shop - so artists can sell their work</li>
            </ul>
        </div>
        )
}