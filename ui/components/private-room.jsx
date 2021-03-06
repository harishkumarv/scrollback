/* eslint-env es6 */

"use strict";

module.exports = (core, config, store) => {
	const React = require("react"),
		  FollowButton = require("./follow-button.jsx")(core, config, store);

	class PrivateRoom extends React.Component {
		constructor(props) {
			super(props);

			this.state = this.buildState();
		}

		buildState() {
			let rel = store.getRelation(this.props.room);

			return {
				requested: (rel && rel.transitionRole === "follower" && rel.transitionType === "request")
			};
		}

		render() {
			return (
				<div {...this.props} className={this.props.className + " blankslate-area blankslate-area-gray"}>
					<div className="blankslate-area-inner">
						<h2 className="blankslate-area-title">
							This room is private!
						</h2>

						<p className="blankslate-area-message">
							Follow the room to access it's content.
						</p>

						<img className="blankslate-area-image" src="/s/assets/blankslate/stop.png" />

						<p className="blankslate-area-actions">
							<FollowButton className={"button" + (this.state.requested ? " disabled" : "")}>
								{this.state.requested ? "Request sent" : "Follow " + store.get("nav", "room")}
							</FollowButton>
						</p>
					</div>
				</div>
			);
		}

		onStateChange(changes) {
			let user = this.props.user || store.get("user");

			if (changes.user || (changes.indexes && (changes.indexes.userRooms && changes.indexes.userRooms[user]))) {
				this.setState(this.buildState);
			}
		}

		componentDidMount() {
			this.changeListener = this.onStateChange.bind(this);

			core.on("statechange", this.changeListener, 500);
		}

		componentWillUnmount() {
			core.off("statechange", this.changeListener);
		}
	}

	return PrivateRoom;
};
