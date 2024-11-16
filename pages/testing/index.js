
    <Layout>
      <main className="order-list">
        <div className="filter-container">
          <label htmlFor="date-filter">Filter by Date:</label>
          <select
            id="date-filter"
            value={selectedDate}
            onChange={handleDateChange}
          >
            {availableDates.map((date) => {
              const userOrdersForDate = orders.filter(
                (order) =>
                  order.toId === supplierID && 
                  order.order_date.split("T")[0] === date 
              );
              const orderCount = userOrdersForDate.length;
              return (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  {orderCount > 0 && ` (${orderCount} Orders)`}
                </option>
              );
            })}
          </select>
        </div>

        <div className="order-container">
          {filteredOrders.length === 0 ? (
            <h1>No Orders</h1> 
          ) : (
            filteredOrders.map((order) => {
              const orderStatus = getOrderStatus(order?.order_status);
              return (
                <div key={order.order_id} className="order-card">
                  <div className="order-div">
                    <div className="order-id">
                      <div style={{ color: "#9252AA" }}>
                        Order Id: {getOrderId(order.order_id)}
                      </div>
                      <h6
                        className="order-otp mt-2"
                        style={{ color: "#9252AA" }}
                      >
                        OTP: {order?.otp}
                      </h6>
                    </div>

                    {/* Order Status Section */}
                    <div className="order-status">
                      <span className={orderStatus.className}>
                        {orderStatus.status}
                      </span>
                      <h6
                        className="mt-2"
                        style={{
                          color: "#9252AA",
                          marginTop: "10px",
                          marginLeft: "10px",
                        }}
                      >
                        {getOrderType(order?.type)}
                      </h6>
                    </div>
                  </div>

                  {/* Order Details Section */}
                  <div className="order-details">
                    <div className="left-details">
                      <div>
                        <Image
                          className="contact-us-img"
                          src={date_time_icon}
                          height={20}
                          width={20}
                        />{" "}
                        <span>{formatDate(order.order_date)}</span>
                      </div>
                      {order.order_time && (
                        <div>
                          <Image
                            className="contact-us-img"
                            src={clock}
                            height={20}
                            width={20}
                          />{" "}
                          <span>{order.order_time}</span>
                        </div>
                      )}
                      {supplierJobType !== "1" && order.no_of_people && (
                        <div>
                          <Image
                            className="contact-us-img"
                            src={people}
                            height={20}
                            width={20}
                          />{" "}
                          <span>{order?.no_of_people}</span>
                        </div>
                      )}
                    </div>
                    <div className="right-details">
                      {order.addressId?.[0]?.city && (
                        <div>
                          <strong
                            style={{ color: "#9252AA", fontSize: "13px" }}
                          >
                            City
                            <p style={{ textAlign: "end", margin: 0 }}>
                              {order.addressId[0].city}
                            </p>
                          </strong>
                        </div>
                      )}
                      <div>
                       
                      {
                         
                         order.phone_no ? order.total_amount - order.advance_amount : 
                          <strong style={{ color: "#9252AA", fontSize: "13px" }}>
                         Balance Amount
                         {order?.type === 2 || order?.type === 3 || order?.type === 4 || order?.type === 5 ? (
                         <p className="mb-0 price-para">
                         {'₹' + Math.round((order?.payable_amount * 4) / 5)}
                         </p>
                         ) : order?.type === 6 || order?.type === 7 ? (
                         <p className="mb-0 price-para">
                         {'₹' + Math.round(order?.payable_amount * 0.35)}
                         </p>
                         ) : (
                         <p className="mb-0 price-para">
                         {'₹' + Math.round(order?.payable_amount * 0.65)}
                         </p>
                         )} 
 
                       </strong>

                        }
                      </div>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <hr className="m-0" />
                  <div className="d-flex button-div">
                    <button
                      className="view-details"
                      onClick={() => handleViewDetail(order)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </Layout>
