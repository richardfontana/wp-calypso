/** @format */

/**
 * External dependencies
 */
import classNames from 'classnames';
import { BlockControls, InspectorControls } from '@wordpress/editor';
import {
	Button,
	PanelBody,
	RangeControl,
	ToggleControl,
	Toolbar,
	Path,
	SVG,
} from '@wordpress/components';
import { Component, Fragment } from '@wordpress/element';
import { get } from 'lodash';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

export const MAX_POSTS_TO_SHOW = 6;

function PlaceholderPostEdit( props ) {
	const previewClassName = 'related-posts__preview';

	return (
		<div className={ `${ previewClassName }-post` }>
			{ props.displayThumbnails && (
				<Button className={ `${ previewClassName }-post-image-placeholder` } isLink>
					<span
						className={ `${ previewClassName }-post-image-placeholder-icon` }
						aria-label={ __( 'Placeholder image' ) }
					>
						<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
							<Path fill="none" d="M0 0h24v24H0V0z" />
							<Path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z" />
						</SVG>
					</span>
				</Button>
			) }
			<h4>
				<Button className={ `${ previewClassName }-post-link` } isLink>
					{ __( 'Related Posts will only display when you have 10 public posts' ) }
				</Button>
			</h4>
			{ props.displayDate && (
				<span className={ `${ previewClassName }-post-date has-small-font-size` }>
					{ __( 'August 3, 2018' ) }
				</span>
			) }
			{ props.displayContext && (
				<p className={ `${ previewClassName }-post-context` }>{ __( 'In "Uncategorized"' ) }</p>
			) }
		</div>
	);
}

function RelatedPostsEditItem( props ) {
	const previewClassName = 'related-posts__preview';

	return (
		<div className={ `${ previewClassName }-post` }>
			{ props.displayThumbnails && props.post.img && props.post.img.src && (
				<Button className={ `${ previewClassName }-post-link` } isLink>
					<img src={ props.post.img.src } alt={ props.post.title } />
				</Button>
			) }
			<h4>
				<Button className={ `${ previewClassName }-post-link` } isLink>
					{ props.post.title }
				</Button>
			</h4>
			{ props.displayDate && (
				<span className={ `${ previewClassName }-post-date has-small-font-size` }>
					{ props.post.date }
				</span>
			) }
			{ props.displayContext && (
				<p className={ `${ previewClassName }-post-context` }>{ props.post.context }</p>
			) }
		</div>
	);
}

function RelatedPostsPreviewRows( props ) {
	const className = 'related-posts__row';

	let topRowEnd = [];
	let bottomRowStart = [];
	const displayLowerRow = props.posts.length > 3;

	switch ( props.posts.length ) {
		case 2:
		case 4:
		case 5:
			topRowEnd = 2;
			break;
		default:
			topRowEnd = 3;
			break;
	}
	switch ( props.posts.length ) {
		case 4:
		case 5:
			bottomRowStart = 2;
			break;
		default:
			bottomRowStart = 3;
			break;
	}

	return (
		<div className={ className }>
			<div className={ className + '-upper' }>{ props.posts.slice( 0, topRowEnd ) }</div>
			{ displayLowerRow && (
				<div className={ className + '-lower' }>{ props.posts.slice( bottomRowStart ) }</div>
			) }
		</div>
	);
}

class RelatedPostsEdit extends Component {
	render() {
		const { attributes, className, posts, setAttributes } = this.props;
		const { displayContext, displayDate, displayThumbnails, postLayout, postsToShow } = attributes;

		const layoutControls = [
			{
				icon: 'grid-view',
				title: __( 'Grid View' ),
				onClick: () => setAttributes( { postLayout: 'grid' } ),
				isActive: postLayout === 'grid',
			},
			{
				icon: 'list-view',
				title: __( 'List View' ),
				onClick: () => setAttributes( { postLayout: 'list' } ),
				isActive: postLayout === 'list',
			},
		];

		// To prevent the block from crashing, we need to limit ourselves to the
		// posts returned by the backend - so if we want 6 posts, but only 3 are
		// returned, we need to limit ourselves to those 3 and fill in the rest
		// with placeholders.
		//
		// Also, if the site does not have sufficient posts to display related ones
		// (minimum 10 posts), we also use this code block to fill in the
		// placeholders.
		const previewClassName = 'related-posts__preview';
		const displayPosts = [];
		for ( let i = 0; i < postsToShow; i++ ) {
			if ( posts[ i ] ) {
				displayPosts.push(
					<RelatedPostsEditItem
						key={ previewClassName + '-' + i }
						post={ posts[ i ] }
						displayThumbnails={ displayThumbnails }
						displayDate={ displayDate }
						displayContext={ displayContext }
					/>
				);
			} else {
				displayPosts.push(
					<PlaceholderPostEdit
						key={ 'related-post-placeholder-' + i }
						displayThumbnails={ displayThumbnails }
						displayDate={ displayDate }
						displayContext={ displayContext }
					/>
				);
			}
		}

		return (
			<Fragment>
				<InspectorControls>
					<PanelBody title={ __( 'Related Posts Settings' ) }>
						<ToggleControl
							label={ __( 'Display thumbnails' ) }
							checked={ displayThumbnails }
							onChange={ value => setAttributes( { displayThumbnails: value } ) }
						/>
						<ToggleControl
							label={ __( 'Display date' ) }
							checked={ displayDate }
							onChange={ value => setAttributes( { displayDate: value } ) }
						/>
						<ToggleControl
							label={ __( 'Display context (category or tag)' ) }
							checked={ displayContext }
							onChange={ value => setAttributes( { displayContext: value } ) }
						/>
						<RangeControl
							label={ __( 'Number of posts' ) }
							value={ postsToShow }
							onChange={ value =>
								setAttributes( { postsToShow: Math.min( value, MAX_POSTS_TO_SHOW ) } )
							}
							min={ 1 }
							max={ MAX_POSTS_TO_SHOW }
						/>
					</PanelBody>
				</InspectorControls>

				<BlockControls>
					<Toolbar controls={ layoutControls } />
				</BlockControls>

				<div
					className={ classNames( className, {
						'is-grid': postLayout === 'grid',
						[ `columns-${ postsToShow }` ]: postLayout === 'grid',
					} ) }
				>
					<div className={ previewClassName }>
						<RelatedPostsPreviewRows posts={ displayPosts } />
					</div>
				</div>
			</Fragment>
		);
	}
}

export default withSelect( select => {
	const { getCurrentPost } = select( 'core/editor' );
	const posts = get( getCurrentPost(), 'jetpack-related-posts', [] );

	return {
		posts,
	};
} )( RelatedPostsEdit );
