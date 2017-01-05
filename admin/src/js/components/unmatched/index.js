import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import cs from 'classnames';
import Map, { GoogleApiWrapper } from 'google-maps-react'

import camelize from 'camelize';
const evtNames = ['click', 'mouseover', 'recenter'];

const wrappedPromise = function() {
    var wrappedPromise = {},
        promise = new Promise(function (resolve, reject) {
            wrappedPromise.resolve = resolve;
            wrappedPromise.reject = reject;
        });
    wrappedPromise.then = promise.then.bind(promise);
    wrappedPromise.catch = promise.catch.bind(promise);
    wrappedPromise.promise = promise;

    return wrappedPromise;
}

export class Marker extends React.Component {

    componentDidMount() {
        this.markerPromise = wrappedPromise();
        this.renderMarker();
    }

    componentDidUpdate(prevProps) {
        if ((this.props.map !== prevProps.map) ||
            (this.props.position !== prevProps.position)) {
            this.renderMarker();
        }
    }

    componentWillUnmount() {
        if (this.marker) {
            this.marker.setMap(null);
        }
    }

    renderMarker() {
        let {
            map, google, position, mapCenter, color
        } = this.props;
        if (!google) {
            return null
        }

        let pos = position || mapCenter;
        if (!(pos instanceof google.maps.LatLng)) {
            position = new google.maps.LatLng(pos.lat, pos.lng);
        }

        var pinColor = color;
        var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
            new google.maps.Size(21, 34),
            new google.maps.Point(0,0),
            new google.maps.Point(10, 34));
        var pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
            new google.maps.Size(40, 37),
            new google.maps.Point(0, 0),
            new google.maps.Point(12, 35));

        const pref = {
            map: map,
            position: position,
            icon: pinImage,
            shadow: pinShadow
        };
        this.marker = new google.maps.Marker(pref);

        evtNames.forEach(e => {
            this.marker.addListener(e, this.handleEvent(e));
    });

        this.markerPromise.resolve(this.marker);
    }

    getMarker() {
        return this.markerPromise;
    }

    handleEvent(evt) {
        return (e) => {
            const evtName = camelize(`on-${evt}`);
            if (this.props[evtName]) {
                this.props[evtName](this.props, this.marker, e);
            }
        }
    }

    render() {
        return null;
    }
}

Marker.propTypes = {
    position: PropTypes.object,
    map: PropTypes.object,
    color: PropTypes.string,
}

evtNames.forEach(e => Marker.propTypes[e] = PropTypes.func)

Marker.defaultProps = {
    name: 'Marker'
}

class Person extends React.Component {
    getAdults() {
        const { person } = this.props;

        return parseInt(person.adults_f, 10) + parseInt(person.adults_m, 10);
    }

    renderDistance() {
        if (this.props.person.distance === undefined && (this.props.person.loc_lat === null || this.props.person.loc_long === null)) {
            return <span className="distance">
                <svg className="octicon octicon-alert" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path d="M8.865 1.52c-.18-.31-.51-.5-.87-.5s-.69.19-.87.5L.275 13.5c-.18.31-.18.69 0 1 .19.31.52.5.87.5h13.7c.36 0 .69-.19.86-.5.17-.31.18-.69.01-1L8.865 1.52zM8.995 13h-2v-2h2v2zm0-3h-2V6h2v4z"></path></svg>
            </span>
        }

        if (this.props.person.distance === undefined) {
            return null;
        }

        const distance = this.props.person.distance > 1 ? Math.floor(this.props.person.distance) : this.props.person.distance.toFixed(1);
        return <span className="distance"><b>{distance} km</b></span>;
    }

    render() {
        const { person, selected } = this.props;

        const className = cs({ selected });

        return <li className={className} onClick={() => this.props.onClick(person)}>
            <b>{this.getAdults()} adults. {person.children} children.</b>
            <div className={'info'}>
                <span className="name">{person.name}</span> <span className="info">{person.age} år. {person.adults_f} females. {person.adults_m} males. {person.children} children.</span> <span className="origin">{person.origin}.</span> <br />
                <span className="bringing">{person.bringing || <i>No people description</i>}</span> <br />

                <span className="phone">Phone: <a href={`tel:${person.phone}`}>{person.phone}</a></span> <span className="email">Email <a href={`mailto:${person.email}`}>{person.email}</a></span> <br />
                <span className="address">{person.address} {person.zipcode}</span>
            </div>
            <div className="freetext">{person.freetext || <i>No description</i>}</div>
            {this.renderDistance()}
            <div className="updated">{person.waited}</div>
        </li>
    }
}

class Hosts extends React.Component {
    renderFilters() {
        return <div className="filters">
            <span className="info">
                Show hosts with:
            </span>
            <label>
                <select onChange={e => this.props.setDistance(parseInt(e.target.value, 10))}>
                    <option value="20">20 km</option>
                    <option value="10">10 km</option>
                    <option value="5">5 km</option>
                    <option value="2">2 km</option>
                </select>
            </label>
            <label>
                <input type="checkbox" onChange={e => this.props.setFilter('men', e.target.checked)} /> Male
            </label>
            <label>
                <input type="checkbox" onChange={e => this.props.setFilter('women', e.target.checked)} /> Female
            </label>
            <label>
                <input type="checkbox" onChange={e => this.props.setFilter('children', e.target.checked)} /> Children
            </label>
        </div>
    }
    renderMap() {
        const { guest, hosts, filters, distance } = this.props;

        console.log(guest);

        const guestPosition = {};
        if (guest.loc_lat && guest.loc_long) {
            guestPosition.lat = parseFloat(guest.loc_lat, 10);
            guestPosition.lng = parseFloat(guest.loc_long, 10);
        } else {
            return null;
        }

        const query = Object.keys(filters).filter(key => filters[key]).map(key => key + '=yes').join('&');

        return <div className="map-view">
            <Map key={guest.id + '-' + query + '-' + distance} google={window.google}
                style={{width: '100%', height: '400px'}}
                className={'map'}
                zoom={12}
                initialCenter={guestPosition}>
                    {hosts.filter(host => {
                        return host.loc_lat && host.loc_long;
                    }).map((host, index) => {
                        const position = {
                            lat: parseFloat(host.loc_lat, 10),
                            lng: parseFloat(host.loc_long, 10)
                        };

                        return (
                            <Marker key={index} position={position} title={host.name} color='e41a1c' onClick={() => this.props.selectHost(host)}/>
                        );
                    }).concat(<Marker key={'guest'} position={guestPosition} color='377eb8'  icon={{ path: google.maps.SymbolPath.CIRCLE, scale: 10 }} />)}
            </Map>
        </div>
    }

    render() {
        const { guest, hosts, selectHost } = this.props;

        return <div>
            {this.renderFilters()}
            {this.renderMap()}
            <ul>
                {hosts.map(host => {
                    const selected = this.props.selectedHost && this.props.selectedHost.id === host.id;
                    return <Person key={host.id + '-' + (selected ? 1 : 0)}
                        person={host}
                        selected={selected}
                        onClick={selectHost}
                    />
                })}
            </ul>
        </div>
    }
}

export default class Unmatched extends React.Component {
    constructor() {
        super();

        this.state = {
            guests: [],
            hosts: [],
            selectedGuest: null,
            selectedHost: null,
            filters: {
                men: false,
                women: false,
                children: false
            },
            distance: 20
        };

        this.selectGuest = this.selectGuest.bind(this);
        this.selectHost = this.selectHost.bind(this);
        this.setFilter = this.setFilter.bind(this);
        this.setDistance = this.setDistance.bind(this);
        this.matchUsers = this.matchUsers.bind(this);
    }

    componentDidMount() {
        this.fetchGuests();
    }

    setFilter(filter, val) {
        const filters = Object.assign(this.state.filters, {
            [filter]: val
        });

        this.setState({ filters })
        this.fetchHosts();
    }

    setDistance(distance) {
        this.setState({ distance }, () => this.fetchHosts())
    }

    matchUsers() {
        fetch('/api/match', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                guest_id: this.state.selectedGuest.id,
                host_id: this.state.selectedHost.id,
                comment: ''
            })
        }).then(res => res.json()).then(guests => {
            this.setState({
                selectedGuest: null,
                selectedHost: null
            });

            return Promise.all([
                this.fetchGuests()
            ])
        });
    }

    selectGuest(guest) {
        this.setState({ selectedGuest: guest, selectedHost: null });
        this.fetchHosts(guest);
    }

    fetchGuests() {
        return fetch('/api/guests', {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(guests => {
            this.setState({ guests })
        });
    }

    fetchHosts(guest) {
        const { filters, selectedGuest, distance } = this.state;
        const query = Object.keys(filters).filter(key => filters[key]).map(key => key + '=yes');
        var filterGuest = undefined;

        if (selectedGuest == undefined) {
          filterGuest = guest;
        } else {
          filterGuest = selectedGuest;
        }

        if (filterGuest) {
            query.push(`guest_id=${filterGuest.id}`);
        }

        if (distance) {
            query.push(`distance=${distance}`);
        }

        console.log(distance, query)

        const queryString = query.join('&');
        return fetch(`/api/hosts?${queryString}`, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(hosts => {
            this.setState({ hosts })
        });
    }

    selectHost(host) {
        this.setState({ selectedHost: host });
    }

    renderHosts() {
        if (!this.state.selectedGuest) {
            return null;
        }

        return <Hosts guest={this.state.selectedGuest}
            hosts={this.state.hosts}
            filters={this.state.filters}
            distance={this.state.distance}
            setFilter={this.setFilter}
            setDistance={this.setDistance}
            selectHost={this.selectHost}
            selectedHost={this.state.selectedHost}
            />;
    }

    render() {
        const matchBoxCs = cs('match', {
            active: this.state.selectedGuest && this.state.selectedHost
        });

        return (
            <div className="unmatched">
                <div className="row">
                    <div className="col-sm-12">
                        <button className={matchBoxCs} onClick={() => this.matchUsers()}>
                            Match guest with host
                        </button>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-6">
                        <h1>Unmatched guests</h1>
                        <ul>
                            {this.state.guests.map(guest => {
                                const selected = this.state.selectedGuest && this.state.selectedGuest.id === guest.id;
                                return <Person key={guest.id + '-' + (selected ? 1 : 0)}
                                    person={guest}
                                    selected={selected}
                                    onClick={this.selectGuest} />
                            })}
                        </ul>
                    </div>
                    <div className="col-sm-6">
                        <h1>Available hosts</h1>
                        {this.renderHosts()}
                    </div>
                </div>
            </div>
        )
    }
}
