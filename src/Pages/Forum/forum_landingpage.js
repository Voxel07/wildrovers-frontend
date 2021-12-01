import React from 'react';
import axios from 'axios'

class forum_landingpage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            department: '',
            street: '',
            postalcode: '',
            state: '',
            country: '',
            status: ''
        };

        this.handleSubmit = this.handleSubmit.bind(this);
    }
    Changehandler = (event) => {
        this.setState({ [event.target.name]: event.target.value })
    }

    handleSubmit = event => {
        event.preventDefault();
        axios.put('http://localhost:8080/company', this.state)
            .then(response => {
                this.setState({ status: response.data })
                this.ClearInput();
                this.props.cbToBar(true);
                this.props.cbToBar(false);
            })
            .catch(error => {
                // this.setState({errorMsg: 'Keine Daten erhalten'})
            })

    }

    ClearInput() {
        this.setState({ name: '', department: '', street: '', postalcode: '', state: '', country: '' })
    }


    render() {
        const { name, department, street, postalcode, state, country, status } = this.state
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <div>
                        <legend >Add Company:   </legend>
                        <div className="container"  >
                            <h1 className="title">{name}</h1>
                            <div className=" form-row ">
                                <div className="form-group col-12 col-sm-6 my-2 p-2 ">
                                    <label> Name</label>
                                    <input
                                        placeholder="Name"
                                        className="form-control1 "
                                        name="name"
                                        type="text"
                                        value={name} onChange={this.Changehandler} />
                                </div>
                                <div className=" form-group col-12 col-sm-6 my-2 p-2">
                                    <label> Department </label>
                                    <input
                                        placeholder="Department"
                                        className="form-control1"
                                        name="department"
                                        type="text"
                                        value={department} onChange={this.Changehandler} />
                                </div>
                            </div>
                            <div className=" form-row ">
                                <div className=" form-group col-12 col-sm-6 my-2 p-2">
                                    <label> Street </label>
                                    <input
                                        placeholder="Street"
                                        className="form-control1"
                                        name="street"
                                        type="text"
                                        value={street} onChange={this.Changehandler} />

                                </div>
                                <div className="form-group col-12 col-sm-6 my-2 p-2">
                                    <label> state </label>
                                    <input
                                        placeholder="state"
                                        className="form-control1"
                                        name="state"
                                        type="text"
                                        value={state} onChange={this.Changehandler} />

                                </div>
                            </div>
                            <div className=" form-row ">
                                <div className="form-group col-12 col-sm-6 my-2 p-2">
                                    <label> Country </label>
                                    <input
                                        placeholder="Country"
                                        className="form-control1"
                                        name="country"
                                        type="text"
                                        value={country} onChange={this.Changehandler} />
                                </div>
                                <div className=" form-group col-12 col-sm-6 my-2 p-2">
                                    <label> postalcode </label>
                                    <input
                                        placeholder="postalcode"
                                        className="form-control1"
                                        name="postalcode"
                                        type="number"
                                        value={postalcode} onChange={this.Changehandler} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 text-center">
                        <button type="submit" class=" btn-primary1 ">Add</button>
                    </div>
                </form>

            </div>
        );
    }
}

export default forum_landingpage;