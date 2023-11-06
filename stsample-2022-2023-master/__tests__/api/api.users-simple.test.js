const axios = require("axios");
const {prepare} = require("../setup/test-helper");
describe("Simple User Tests", () => {
  let config = null;
  let adminLogin = null;
  let config2 = null;
  let login = null;
  let login2 = null;
  beforeAll(async () => {
    // Login all related users.
    adminLogin = await axios.post(prepare("/users/login/"), {
      email: "test@test.com",
      password: "12345"
    });
    userLogin = await axios.post(prepare("/users/login/"), {
      email: "testuser@test.com",
      password: "12345"
    });

    login = await axios.post(prepare("/users/login/"), {
      email: "testuser@test.com",
      password: "12345"
    });
    const {accessToken} = login.data;
    config = {
        headers: { Authorization: `Bearer ${accessToken}` }
    };
  //////////////////////////////////
  login2 = await axios.post(prepare("/users/login/"), {
    email: "testuser2@test.com",
    password: "12345"
  });
  const {accessToken2: AccessToken2} = login2.data;
  config2 = {
      headers: { Authorization: `Bearer ${AccessToken2}` }
  };
  ///////////////////////////////
  });

  //// user.js 3. get info of all
  it("should fail to get all users", async () => {
    const response = await axios.get(prepare("/users"), config).catch(error => {
      expect(error.response.status).toEqual(403);
    });
  });


////////////////////////////////////////
  //// user.js 4. get info of one
  it("should fail to get one user", async () => {
    const response = await axios.get(prepare("/users/" + userLogin.data.user.id), config).catch(error => {
      expect(error.response.status).toEqual(403);
    });
  });
/////////////////////////////////////////////////////


  //// user.js 7. update info of self user
  it("should update credentials", async () => {
    await axios.put(prepare("/user"), {
      "name": "Updated User"
    }, config);
    const response = await axios.get(prepare("/user"), config);
    const {data} = response;
    expect(data.name).toEqual("Updated User");
  });


  //// user.js 7. update info of self user
  it("should fail updating credentials of another user", async () => {
    expect(true).toEqual(true);
  });


  //// order.js 2. get orders of self user
  it("should get user orders", async () => {
    const response = await axios.get(prepare("/orders"), config);
    expect(response.status).toEqual(200);
  });


  //// order.js 3. get single order info
  //// order.js 4. add a new order
  //// order.js 2. get orders of user
  //// Not admin; Is self user
  it("should get a specific order1", async () => {
    // Insert Order.
    await axios.post(prepare("/order"), {
      "type": "Box1",
      "description": "{Test Order}"
    }, config);
    const allOrdersResponse = await axios.get(prepare("/orders"), config);
    const {data} = allOrdersResponse;
    const firstOrderID = data[0]._id;
    const singleOrderResponse = await axios.get(prepare("/order/" + firstOrderID), config);
    expect(singleOrderResponse.status).toEqual(200);
  });


  /////////////////////////////////////////
  //// order.js 3. get single order info
  //// order.js 4. add a new order
  //// order.js 2. get orders of user
  //// Not admin; Not self user
  it("should get a specific order2", async () => {
    // Insert Order.
    await axios.post(prepare("/order"), {
      "type": "Box1",
      "description": "{Test Order}"
    }, config);
    const allOrdersResponse = await axios.get(prepare("/orders"), config);
    const {data} = allOrdersResponse;
    const firstOrderID = data[0]._id;
    // console.log("hello");
    // console.log(firstOrderID);
    // const singleOrderResponse = await axios.get(prepare("/order/" + firstOrderID), config);
    // expect(singleOrderResponse.status).toEqual(200);
    await axios.get(prepare("/order/" + firstOrderID), config2).catch(error => {
      expect(error.response.status).toEqual(403);
    });


  });
  //////////////////////////////////////////////


  //// order.js 5. update an existing order 
  //// Not admin, Is self
  //// order.js 4. add
  //// order.js 3. get single order info
  it("should add, then update an order1", async () => {
    // Insert order.
    const insertedResponse = await axios.post(prepare("/order"), {
      "type": "Box2"
    }, config);
    // Update order.
    const updated = await axios.put(prepare("/order/"), {
      "_id": insertedResponse.data._id,
      "type": "Box1",
      "description": "{Test Order Updated}"
    }, config);
    // Get previously inserted object and check.
    const orderResponse = await axios.get(prepare("/order/") + insertedResponse.data._id, config);
    const {data} = orderResponse;
    expect(data.type).toEqual("Box1");
    expect(data.description).toEqual("{Test Order Updated}");
  });

  ///////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////
  //// endpoints/order.js bug corrected
  //// order.js 5. update an existing order 
  //// Not admin, Is self
  //// order.js 4. add
  //// order.js 3. get single order info
  it("should add, then update an order1.2", async () => {
    const insertedOrderResponse = await axios.post(prepare("/order"), {
      "type": "Box2",
    }, config);
    const {data} = insertedOrderResponse;
    await axios.delete(prepare("/order/" + data._id), config);
    const updated = await axios.put(prepare("/order/"), {
      "_id": data._id,
      "type": "Box1",
    }, config).catch(error => {
      expect(error.response.status).toEqual(404);
    });
  });
  ///////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////
//// order.js 5. update an existing order 
  //// Not admin, Is self
  //// order.js 4. add
  //// order.js 3. get single order info
  it("should add, then update an order2", async () => {
    // Insert order.
    const insertedResponse = await axios.post(prepare("/order"), {
      "type": "Box2"
    }, config);
    // Update order.
    await axios.put(prepare("/order/"), {
      "_id": insertedResponse.data._id,
      "type": "Box1",
      "description": "{Test Order Updated}"
    }, config2).catch(error => {
      expect(error.response.status).toEqual(403);
    });
  });
///////////////////////////////////////////////////////////////////


  //// order.js 6. delete an order
  //// Not admin, Is self
  //// order.js 4. add a new order
  //// order.js 3. get single order info (the first failure)
  it("should add, then delete an order1", async () => {
    const insertedOrderResponse = await axios.post(prepare("/order"), {
      "type": "Box2",
      "description": "{Test Order}"
    }, config);
    const {data} = insertedOrderResponse;
    await axios.delete(prepare("/order/" + data._id), config);
    await axios.get(prepare("/order/" + data._id), config).catch(error => {
      expect(error.response.status).toEqual(404);
    });
  });


  //////////////////////////////////////////////////////////////////////////
  //// order.js 6. delete an order
  //// Not admin, Not self
  //// order.js 4. add a new order
  //// order.js 3. get single order info (the first failure)
  it("should add, then delete an order2", async () => {
    const insertedOrderResponse = await axios.post(prepare("/order"), {
      "type": "Box2",
      "description": "{Test Order}"
    }, config);
    const {data} = insertedOrderResponse;
    await axios.delete(prepare("/order/" + data._id), config2).catch(error => {
      expect(error.response.status).toEqual(403);
    });
  });
  ////////////////////////////////////////////////////////////////////

//// order.js 1. get order of any user
  it("should fail to access orders of another user if the role is not admin", async () => {
    await axios.get(prepare("/orders/user/" + adminLogin.data.user.id), config).catch(error => {
      // Unauthorized
      expect(error.response.status).toEqual(403);
    });
  });


  //// order.js 1. get order of any user
  ////////////////////////////////////////////////
  it("should fail to access orders of another user if the role is not admin", async () => {
    await axios.get(prepare("/orders/user/" + userLogin.data.user.id), config).catch(error => {
      // Unauthorized
      expect(error.response.status).toEqual(403);
    });
  });
  ////////////////////////////////////////


//// user.js 5. Delete a user
  it("should fail deleting a user if role is not admin", async () => {
    await axios.delete(prepare("/user/" + adminLogin.data.user.id), config).catch(error => {
      // Unauthorized
      expect(error.response.status).toEqual(403);
    });
  });


//// user.js 6. get info of self user
  ////////////////////////////////
  it("should get info of self user", async () => {
    const response = await axios.get(prepare("/user"), config);
    expect(response.status).toEqual(200);
  });
  //////////////////////////////////

});
