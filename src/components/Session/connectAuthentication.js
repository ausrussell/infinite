import { connect } from 'react-redux'




const connectAuthentication = connect(
    // Map redux state to component props
    ({ firebase: { auth, profile } }) => ({
      auth,
      profile
    })
  )

  export default connectAuthentication;
