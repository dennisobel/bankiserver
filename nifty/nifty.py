import logging
from niftyclient import NiftyClient
import sys, json


# client initialisation
class Config:
    key_id = "f3900274b7784506e427523d7026f76c"
    secret = "c05443412e0858c0f37e6345335534bd8c8e8877f8abc52e8eca91e17cc68541"
    user_id = "f861c6cc-4efa-4306-8eee-08f035b03772"
    api_base = 'https://api.nifty.co.ke/api/v1'  # Uncomment this if you are in production

#Read data from stdin
def read_in():
    lines = sys.stdin.readlines()
    print json.loads(lines[0])
    # Since our input would only be having one line, parse our JSON data from that
    return json.loads(lines[0])

# logger
def mk_logger(level=logging.INFO):
    log_format = (
        '%(asctime)s - %(name)s - %(levelname)s - '
        '[%(filename)s:%(lineno)s %(funcName)s()] - %(message)s')
    logging.basicConfig(format=log_format, level=level)
    logger = logging.getLogger('wallet_example')
    return logger


# get all wallets
def enumerate_wallets(client, logger):
    result = client.wallet.get_wallet()
    logger.info(
        (
            "[i] Viewing {result.returned_resultset_size} wallets "
            "out of {result.available_resultset_size}"
        ).format(result=result)
    )
    for wallet in result.wallets:
        logger.info(
            (
                " > Wallet: user={wallet.user_name}, "
                "balance={wallet.balance}, "
                "created={wallet.created_at}, "
                "modified={wallet.last_modified}, "
            ).format(wallet=wallet)
        )
    logger.info("")

# enumerate online transactions
def enumerate_online_checkout_transactions(client, logger, **kwargs):
    result = client.online_checkout.list_transactions(**kwargs)
    logger.info(
        (
            "[i] Viewing {result.returned_resultset_size} "
            "transactions out of {result.available_resultset_size}"
        ).format(result=result)
    )
    for transaction in result.transactions:
        logger.info(
            (
                " > Transaction: phone_number={trx.phone_number}, "
                "payment_id={trx.payment_id}, status={trx.status}"
            ).format(trx=transaction))
    logger.info("")


if __name__ == '__main__':    
    lines = read_in()
    
    logger = mk_logger()
    client = NiftyClient(Config(), logger)
    # print("wassup")
    # Wallets:
    # Create wallet
    # print(client.wallet.create_wallet())
    logger.info("")
    enumerate_wallets(client, logger)

    # initiate online checkout

    # Online Checkout
    # Iniate an online checkout
    

    result = client.online_checkout.initiate_checkout(
        phone_number=lines[0], 
        transaction_amount=lines[1],
        service_reference_id=lines[2],
        transaction_id=lines[3],
        
        callback_url='https://merchant.co.ke/callback/oc/trx/0xdeadbeef')
    if result and result.transactions:
        print (
            "#{trx.payment_id}> Requested #{trx.transaction_amount}"
            " from #{trx.phone_number}".format(trx=result.transactions[0]))
    
 
    # result = client.online_checkout.initiate_checkout(
    #     phone_number='254721224756', transaction_amount=10, service_reference_id="python-test")  

    enumerate_online_checkout_transactions(client, logger, limit=1, offset=2)                  
    

    
    # 254727677068
    # 254721224756

    # till_number='291222',

    # phone_number='254727677068', 
    # transaction_amount=10,
    # service_reference_id="kbsacco",
    # transaction_id='f861c6cc-4efa-4306-8eee-08f035b03772',    

    # lines[3],